import { Link } from "react-router-dom";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { useForm } from "../../hooks/useForm";
import authService from "../../services/authService";
import { useToast } from "../../context/ToastContext";

export default function ForgotPasswordPage() {
  const { showToast } = useToast();
  const { values, errors, handleChange, handleSubmit } = useForm(
    { email: "" },
    (current) => (!current.email ? { email: "Email is required." } : {})
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="panel w-full max-w-lg p-8">
        <h1 className="text-3xl font-extrabold text-slate-950">Forgot password</h1>
        <p className="mt-2 text-sm text-slate-500">Enter your email and we will send reset instructions.</p>
        <form
          onSubmit={handleSubmit(async (payload) => {
            const response = await authService.forgotPassword(payload);
            showToast(response.message, "success");
          })}
          className="mt-6 space-y-5"
        >
          <Input label="Work email" name="email" value={values.email} onChange={handleChange} error={errors.email} />
          <Button type="submit" className="w-full">
            Send reset link
          </Button>
        </form>
        <Link to="/login" className="mt-5 inline-flex text-sm font-semibold text-brand-600">
          Back to login
        </Link>
      </div>
    </div>
  );
}
