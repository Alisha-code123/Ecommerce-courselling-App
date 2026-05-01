import React, { useState } from "react";
import "./auth.css";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { server } from "../../main";

const ResetPassword = () => {
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otp || !password || !confirmPassword) {
      return toast.error("All fields are required");
    }

    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    setBtnLoading(true);

    try {
      const { data } = await axios.post(
        `${server}/api/user/reset`,
        {
          email,
          otp,
          password,
          confirmPassword,
        }
      );

      toast.success(data.message);
      navigate("/login");

    } catch (error) {
      toast.error(error.response?.data?.message);
    }

    setBtnLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-form">
        <h2>Reset Password</h2>

        <form onSubmit={handleSubmit}>
          <label>Enter OTP</label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />

          <label>New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label>Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button disabled={btnLoading} className="common-btn">
            {btnLoading ? "Please Wait..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;