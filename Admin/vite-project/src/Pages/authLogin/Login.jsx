

// // src/components/Login.jsx  or  src/pages/Login.jsx
// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { LogIn, Mail, Lock } from 'lucide-react';
// import { toast } from 'react-toastify';
// import { loginUser } from '../../Pages/auth/authSlice.js'; // adjust path

// const Login = () => {
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//   });

//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const { isLoading, error } = useSelector((state) => state.auth);

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const toastId = toast.loading('Logging in...');

//     const resultAction = await dispatch(loginUser(formData));

//     if (loginUser.fulfilled.match(resultAction)) {
//       // Success
//       toast.update(toastId, {
//         render: 'Login successful! Redirecting...',
//         type: 'success',
//         isLoading: false,
//         autoClose: 1800,
//       });

//       setTimeout(() => {
//         navigate('/dashboard', { replace: true });
//       }, 900);
//     } else {
//       // Failed
//       const errorMsg = resultAction.payload || 'Something went wrong';
//       toast.update(toastId, {
//         render: errorMsg,
//         type: 'error',
//         isLoading: false,
//         autoClose: 5000,
//       });
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
//       <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
//         {/* Header */}
//         <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center">
//           <div className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center mb-4">
//             <LogIn className="w-8 h-8 text-blue-600" />
//           </div>
//           <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
//           <p className="text-blue-100 mt-2">Sign in to continue</p>
//         </div>

//         {/* Form */}
//         <div className="p-8">
//           <form onSubmit={handleSubmit} className="space-y-6">
//             {/* Email */}
//             <div>
//               <label
//                 htmlFor="email"
//                 className="block text-sm font-medium text-gray-700 mb-1"
//               >
//                 Email
//               </label>
//               <div className="relative">
//                 <Mail
//                   className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
//                   size={20}
//                 />
//                 <input
//                   id="email"
//                   name="email"
//                   type="email"
//                   required
//                   value={formData.email}
//                   onChange={handleChange}
//                   className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
//                   placeholder="you@example.com"
//                   disabled={isLoading}
//                 />
//               </div>
//             </div>

//             {/* Password */}
//             <div>
//               <label
//                 htmlFor="password"
//                 className="block text-sm font-medium text-gray-700 mb-1"
//               >
//                 Password
//               </label>
//               <div className="relative">
//                 <Lock
//                   className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
//                   size={20}
//                 />
//                 <input
//                   id="password"
//                   name="password"
//                   type="password"
//                   required
//                   value={formData.password}
//                   onChange={handleChange}
//                   className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
//                   placeholder="••••••••"
//                   disabled={isLoading}
//                 />
//               </div>
//             </div>

//             {/* Submit Button */}
//             <button
//               type="submit"
//               disabled={isLoading}
//               className={`w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition flex items-center justify-center gap-2 ${
//                 isLoading ? 'opacity-70 cursor-not-allowed' : ''
//               }`}
//             >
//               {isLoading ? (
//                 <>
//                   <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                   <span>Signing in...</span>
//                 </>
//               ) : (
//                 'Sign In'
//               )}
//             </button>
//           </form>

//           {/* Show redux error if you want (optional) */}
//           {error && (
//             <p className="mt-4 text-center text-red-600 text-sm">{error}</p>
//           )}

//           {/* Footer */}
//           <div className="mt-6 text-center text-sm text-gray-600">
//             <p>
//               Don't have an account?{' '}
//               <a
//                 href="/register"
//                 className="text-blue-600 hover:underline font-medium"
//               >
//                 Sign up
//               </a>
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;


import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { loginUser } from '../../Pages/auth/authSlice.js';
import logo from '../../assets/favicon.webp';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading, error } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const toastId = toast.loading('Logging in...');

    try {
      const resultAction = await dispatch(loginUser(formData));

      if (loginUser.fulfilled.match(resultAction)) {
        toast.update(toastId, {
          render: 'Login successful!',
          type: 'success',
          isLoading: false,
          autoClose: 1800,
        });

        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 900);
      } else {
        toast.update(toastId, {
          render: resultAction.payload || 'Invalid email or password',
          type: 'error',
          isLoading: false,
          autoClose: 4000,
        });
      }
    } catch {
      toast.update(toastId, {
        render: 'Something went wrong. Please try again.',
        type: 'error',
        isLoading: false,
        autoClose: 4000,
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f1e9] px-4 py-8 relative overflow-hidden">

      {/* Background Effects */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#d7a977]/25 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#633638]/15 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md">

        {/* Logo / Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white shadow-xl shadow-[#633638]/10 ring-1 ring-[#e8d5c2] mb-5">
            <img src={logo} alt="AI Knots IT" className="w-16 h-16 object-contain" />
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#8b6045]">
            AI Knots IT
          </p>
          <h1 className="text-3xl font-bold text-[#4c292b] tracking-tight mt-2">
            Welcome back
          </h1>

          <p className="text-[#806d62] mt-2 text-sm">
            Sign in to your administration workspace
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-[#633638]/10 ring-1 ring-[#eadfd4] p-7 sm:p-9">

          <div className="mb-7">
            <h2 className="text-2xl font-bold text-[#4c292b]">
              Login
            </h2>
            <p className="text-sm text-[#806d62] mt-1">
              Enter your credentials to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-[#513b35] mb-2"
              >
                Email Address
              </label>

              <div className="relative">
                <Mail
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a28d7e]"
                />

                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="Enter your email"
                  className="w-full h-12 pl-12 pr-4 bg-[#fbf8f4] border border-[#e8ddd2] rounded-xl text-sm text-[#39292a] outline-none transition-all focus:bg-white focus:border-[#9b6849] focus:ring-4 focus:ring-[#9b6849]/10 disabled:opacity-60"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-[#513b35] mb-2"
              >
                Password
              </label>

              <div className="relative">
                <Lock
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a28d7e]"
                />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="Enter your password"
                  className="w-full h-12 pl-12 pr-12 bg-[#fbf8f4] border border-[#e8ddd2] rounded-xl text-sm text-[#39292a] outline-none transition-all focus:bg-white focus:border-[#9b6849] focus:ring-4 focus:ring-[#9b6849]/10 disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a28d7e] hover:text-[#633638] transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-sm font-semibold text-[#80513e] hover:text-[#4c292b] transition"
              >
                Forgot Password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#633638] to-[#9b6849] text-white font-semibold text-sm shadow-lg shadow-[#633638]/20 hover:from-[#512b2d] hover:to-[#80513e] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Login
                  <ArrowRight size={18} />
                </>
              )}
            </button>

          </form>

          {error && (
            <p className="mt-4 text-center text-sm text-red-500">
              {error}
            </p>
          )}

          {/* Security Note */}
          <div className="mt-7 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-center gap-2 text-slate-400">
              <ShieldCheck size={17} />
              <span className="text-xs">
                Secure Login · Protected Account
              </span>
            </div>
          </div>

        </div>

        <p className="text-center text-xs text-[#8b776a] mt-7">
          © {new Date().getFullYear()} All Rights Reserved.
        </p>

      </div>
    </div>
  );
};

export default Login;
