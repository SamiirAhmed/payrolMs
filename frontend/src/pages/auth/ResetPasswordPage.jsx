import { Link, useNavigate } from "react-router-dom";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { useForm } from "../../hooks/useForm";
import authService from "../../services/authService";
import { useToast } from "../../context/ToastContext";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { values, errors, handleChange, handleSubmit } = useForm(
    { password: "", confirmPassword: "" },
    (current) => {
      const nextErrors = {};
      if (!current.password) nextErrors.password = "New password is required.";
      if (current.password !== current.confirmPassword) nextErrors.confirmPassword = "Passwords must match.";
      return nextErrors;
    }
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="panel w-full max-w-lg p-8">
        <h1 className="text-3xl font-extrabold text-slate-950">Reset password</h1>
        <p className="mt-2 text-sm text-slate-500">Choose a strong password to regain access.</p>
        <form
          onSubmit={handleSubmit(async () => {
            await authService.resetPassword();
            showToast("Password updated successfully.", "success");
            navigate("/login");
          })}
          className="mt-6 space-y-5"
        >
          <Input label="New password" name="password" type="password" value={values.password} onChange={handleChange} error={errors.password} />
          <Input
            label="Confirm password"
            name="confirmPassword"
            type="password"
            value={values.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
          />
          <Button type="submit" className="w-full">
            Update password
          </Button>
        </form>
        <Link to="/login" className="mt-5 inline-flex text-sm font-semibold text-brand-600">
          Back to login
        </Link>
      </div>
    </div>
  );
}
