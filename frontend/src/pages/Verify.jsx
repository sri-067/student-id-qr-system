import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function Verify() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  // College branding configuration
  const collegeConfig = {
    name: "SRI ESHWAR COLLEGE OF ENGINEERING",
    logo: "http://localhost:5173/college-logo.jpg", // Full URL for testing
    colors: {
      primary: "#1e40af", // Blue
      secondary: "#dc2626", // Red
      accent: "#059669" // Green
    },
    tagline: "An Autonomous Institution "
  };

  useEffect(() => {
    async function run() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/verify/${token}`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({ error: 'invalid' }));
          setErr(body.error || 'Verification failed');
          return;
        }
        const body = await res.json();
        setData(body);
      } catch (e) {
        setErr('Network error');
      } finally {
        setLoading(false);
      }
    }
    run();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: `linear-gradient(135deg, ${collegeConfig.colors.primary}15, ${collegeConfig.colors.secondary}15)`}}>
        <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-sm mx-4">
          {/* College Logo */}
          <div className="mb-6">
            <img 
              src={collegeConfig.logo} 
              alt={collegeConfig.name}
              className="h-16 w-auto max-w-32 mx-auto mb-3 object-contain bg-white rounded-lg p-2 shadow-lg"
              onError={(e) => {
                console.log('Logo failed to load:', collegeConfig.logo);
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div className="h-16 w-16 mx-auto mb-3 rounded-full flex items-center justify-center" style={{backgroundColor: collegeConfig.colors.primary, display: 'none'}}>
              <i className="fas fa-university text-white text-2xl"></i>
            </div>
            <h3 className="font-bold text-lg" style={{color: collegeConfig.colors.primary}}>{collegeConfig.name}</h3>
            <p className="text-sm text-gray-500">{collegeConfig.tagline}</p>
          </div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{borderColor: collegeConfig.colors.primary}}></div>
          <p className="text-gray-600">Verifying Student ID...</p>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: `linear-gradient(135deg, ${collegeConfig.colors.secondary}15, #fef2f2)`}}>
        <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-md mx-4">
          {/* College Header */}
          <div className="mb-6 pb-4 border-b border-gray-200">
            <img 
              src={collegeConfig.logo} 
              alt={collegeConfig.name}
              className="h-12 w-auto max-w-24 mx-auto mb-2 object-contain bg-white rounded-lg p-1 shadow-md"
              onError={(e) => {
                console.log('Logo failed to load:', collegeConfig.logo);
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div className="h-12 w-12 mx-auto mb-2 rounded-full flex items-center justify-center" style={{backgroundColor: collegeConfig.colors.primary, display: 'none'}}>
              <i className="fas fa-university text-white text-lg"></i>
            </div>
            <h3 className="font-bold" style={{color: collegeConfig.colors.primary}}>{collegeConfig.name}</h3>
          </div>
          
          <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <i className="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
          <p className="text-red-600 mb-4">{err}</p>
          <div className="text-sm text-gray-500 mb-4">
            Please contact the administrator if you believe this is an error.
          </div>
          <div className="text-xs text-gray-400 pt-4 border-t border-gray-100">
            {collegeConfig.name} - Student ID Verification System
          </div>
        </div>
      </div>
    );
  }

  const isValid = data.status === 'success';
  const isExpired = data.status === 'expired';

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: isValid ? `linear-gradient(135deg, ${collegeConfig.colors.accent}15, #f0fdf4)` :
                 isExpired ? `linear-gradient(135deg, #fbbf2415, #fefce8)` :
                 `linear-gradient(135deg, ${collegeConfig.colors.secondary}15, #fef2f2)`
    }}>
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
        {/* College Header */}
        <div className="p-6 text-center" style={{
          background: `linear-gradient(135deg, ${collegeConfig.colors.primary}, ${collegeConfig.colors.secondary})`
        }}>
          {/* College Logo */}
          <div className="mb-4">
            <img 
              src={collegeConfig.logo} 
              alt={collegeConfig.name}
              className="h-14 w-auto max-w-28 mx-auto mb-2 object-contain bg-white rounded-lg p-1 shadow-md"
              onError={(e) => {
                console.log('Logo failed to load:', collegeConfig.logo);
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div className="h-12 w-12 mx-auto mb-2 bg-white bg-opacity-20 rounded-full flex items-center justify-center" style={{display: 'none'}}>
              <i className="fas fa-university text-white text-lg"></i>
            </div>
            <h3 className="text-white font-bold text-sm">{collegeConfig.name}</h3>
            <p className="text-white text-opacity-80 text-xs">{collegeConfig.tagline}</p>
          </div>
          
          {/* Verification Status */}
          <div className="mx-auto h-16 w-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-3">
            {isValid ? (
              <i className="fas fa-check-circle text-white text-2xl"></i>
            ) : isExpired ? (
              <i className="fas fa-clock text-white text-2xl"></i>
            ) : (
              <i className="fas fa-times-circle text-white text-2xl"></i>
            )}
          </div>
          <h2 className="text-xl font-bold text-white">
            {isValid ? 'VERIFIED STUDENT ID' : isExpired ? 'EXPIRED STUDENT ID' : 'INVALID STUDENT ID'}
          </h2>
        </div>

        {/* Student Info */}
        <div className="p-6">
          <div className="text-center mb-6">
            {data.photoUrl ? (
              <img 
                src={data.photoUrl} 
                alt="Student Photo" 
                className="w-24 h-24 object-cover rounded-full mx-auto mb-4 border-4 border-gray-200"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className="h-24 w-24 bg-gray-200 rounded-full mx-auto mb-4 border-4 border-gray-200 flex items-center justify-center" style={{display: data.photoUrl ? 'none' : 'flex'}}>
              <i className="fas fa-user text-gray-400 text-3xl"></i>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{data.name}</h3>
            <p className="text-gray-600 mb-4">{data.regNo}</p>
          </div>

          {/* Details */}
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Department</span>
              <span className="font-medium text-gray-900">{data.department}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Year</span>
              <span className="font-medium text-gray-900">{data.year}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Status</span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                isValid ? 'bg-green-100 text-green-800' :
                isExpired ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {data.status}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Issued</span>
              <span className="font-medium text-gray-900">
                {new Date(data.issuedAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Expires</span>
              <span className="font-medium text-gray-900">
                {new Date(data.expiry).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Official Footer */}
          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <div className="mb-3">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <i className="fas fa-shield-alt" style={{color: collegeConfig.colors.primary}}></i>
                <span className="text-xs font-semibold" style={{color: collegeConfig.colors.primary}}>OFFICIAL VERIFICATION</span>
              </div>
              <p className="text-xs text-gray-500">
                Verified on {new Date().toLocaleString()}
              </p>
            </div>
            
            <div className="bg-gray-50 -mx-6 -mb-6 px-6 py-3">
              <p className="text-xs font-medium" style={{color: collegeConfig.colors.primary}}>
                {collegeConfig.name}
              </p>
              <p className="text-xs text-gray-400">
                Digital Student ID Verification System
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}