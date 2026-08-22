import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext.jsx";

export default function Onboarding() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [status, setStatus] = useState("pregnant");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onBlur" });

  const onSubmit = async (data) => {
    const profile = { ...data, status, language: "en" };
    // TODO: POST profile to `${API_BASE}/users/me`
    setUser((prev) => ({ ...prev, ...profile }));
    navigate("/app");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background px-6 py-10">
      <h1 className="font-headline text-headline-lg text-on-background mb-2">Let's get to know you</h1>
      <p className="text-on-surface-variant mb-8">Personalize your journey for the best care.</p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6 flex-1">
        <div>
          <label htmlFor="name" className="block text-label-md text-on-surface mb-2">
            What should we call you?
          </label>
          <input
            id="name"
            type="text"
            placeholder="Enter your name"
            className={`w-full min-h-[56px] px-4 rounded-2xl bg-surface-container-lowest border ${
              errors.name ? "border-error" : "border-outline-variant"
            } focus:border-primary focus:ring-1 focus:ring-primary text-on-background`}
            {...register("name", {
              required: "Please tell us your name",
              minLength: { value: 2, message: "Name is too short" },
              maxLength: { value: 60, message: "Name is too long" },
            })}
          />
          {errors.name && <p className="mt-1 text-sm text-error">{errors.name.message}</p>}
        </div>

        <div>
          <span className="block text-label-md text-on-surface mb-3">Which best describes you?</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStatus("pregnant")}
              className={`flex-1 min-h-[48px] rounded-full border flex items-center justify-center gap-2 transition-colors ${
                status === "pregnant"
                  ? "bg-primary text-on-primary border-primary"
                  : "bg-surface-container-lowest text-on-surface-variant border-outline-variant"
              }`}
            >
              <span className="material-symbols-outlined text-sm">pregnant_woman</span>
              I'm Pregnant
            </button>
            <button
              type="button"
              onClick={() => setStatus("parent")}
              className={`flex-1 min-h-[48px] rounded-full border flex items-center justify-center gap-2 transition-colors ${
                status === "parent"
                  ? "bg-primary text-on-primary border-primary"
                  : "bg-surface-container-lowest text-on-surface-variant border-outline-variant"
              }`}
            >
              <span className="material-symbols-outlined text-sm">child_care</span>
              I have a child
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="dueDate" className="block text-label-md text-on-surface mb-2">
            Expected Due Date
          </label>
          <input
            id="dueDate"
            type="date"
            className={`w-full min-h-[56px] px-4 rounded-2xl bg-surface-container-lowest border ${
              errors.dueDate ? "border-error" : "border-outline-variant"
            } focus:border-primary focus:ring-1 focus:ring-primary text-on-background`}
            {...register("dueDate", {
              required: status === "pregnant" ? "Please add your due date" : false,
            })}
          />
          {errors.dueDate && <p className="mt-1 text-sm text-error">{errors.dueDate.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-auto w-full min-h-[56px] rounded-full bg-primary text-on-primary font-headline text-button shadow-sm active:scale-95 transition-transform disabled:opacity-60"
        >
          Continue
        </button>
      </form>
    </div>
  );
}