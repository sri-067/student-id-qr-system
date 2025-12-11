const Student = require('../models/Student');
const VerificationLog = require('../models/VerificationLog');
const { verify } = require('../utils/hmac');

async function verifyByToken(req, res, next) {
  try {
    // token expected: "qrId:sig"
    const token = req.params.token || '';
    const [qrId, sig] = token.split(':');

    const logCommon = {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    };

    // validate input
    if (!qrId || !sig) {
      await VerificationLog.create({ ...logCommon, result: 'invalid', notes: 'malformed token' });
      return res.status(400).json({ error: 'Malformed token' });
    }

    // verify signature first (fast)
    const okSig = verify(qrId, sig, process.env.JWT_SECRET);
    if (!okSig) {
      await VerificationLog.create({ ...logCommon, result: 'invalid', notes: 'bad signature', studentId: null });
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // lookup student by indexed qrId
    const matched = await Student.findOne({ qrId });
    if (!matched) {
      await VerificationLog.create({ ...logCommon, result: 'invalid', notes: 'qrId not found' });
      return res.status(404).json({ error: 'Not found' });
    }

    // determine result (active/expired/suspended)
    const now = new Date();
    let result = 'success';
    if (matched.status !== 'active') result = matched.status;
    else if (matched.cardExpiry && matched.cardExpiry < now) result = 'expired';

    await VerificationLog.create({
      studentId: matched._id,
      scannedAt: new Date(),
      ...logCommon,
      result
    });

    return res.json({
      name: matched.name,
      regNo: matched.regNo,
      department: matched.department,
      year: matched.year,
      photoUrl: matched.photoUrl,
      status: result,
      issuedAt: matched.cardIssuedAt,
      expiry: matched.cardExpiry
    });
  } catch (err) {
    next(err);
  }
  // when matched found:
if (!matched || matched.deleted) {
  await VerificationLog.create({ ...logCommon, result: 'invalid' });
  return res.status(404).json({ error: 'Not found' });
}

}

module.exports = { verifyByToken };
