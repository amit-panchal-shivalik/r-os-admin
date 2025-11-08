import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, resetLoginUser } from "@/store/slices/authSlice";
import { setToLocalStorage } from "@/utils/localstorage";
import { showMessage } from "@/utils/Constant";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import SelectInput from "@/components/CustomInput/SelectInput";
// removed unused Icon import

type Option = { label: string; value: string };

const USER_TYPE_OPTIONS: Option[] = [
  { label: "Registered user", value: "registered_user" },
  {
    label: "Territory governance / committee",
    value: "territory_governance_committee",
  },
  { label: "Channel partner", value: "channel_partner" },
  {
    label: "Developer | Builder | Sales admin",
    value: "developer_builder_sales_admin",
  },
  { label: "GIS operator | Data Admin", value: "gis_operator" },
];

export const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { status, error }: any = useSelector((state: any) => state.auth);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [userType, setUserType] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [touched, setTouched] = useState({
    userName: false,
    phone: false,
    userType: false,
  });

  const phoneNumberPattern = useMemo(() => /^[0-9]{10}$/, []);
  const namePattern = useMemo(() => /^[A-Za-z][A-Za-z .'-]{1,49}$/, []); // 2-50 chars

  const isValidName = useMemo(
    () => namePattern.test(userName.trim()),
    [userName, namePattern]
  );
  const isValidPhone = useMemo(
    () => phoneNumberPattern.test(phoneNumber),
    [phoneNumber, phoneNumberPattern]
  );
  const isValidUserType = useMemo(() => !!userType, [userType]);

  useEffect(() => {
    if (status === "complete") {
      showMessage("OTP sent successfully");
      setSubmitting(false);
      navigate("/otp");
      dispatch(resetLoginUser());
    } else if (status === "failed") {
      showMessage(error, "error");
      setSubmitting(false);
    }
  }, [status, navigate, dispatch, submitting]);

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setPhoneNumber(value);
  };

  const handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s+/g, " ");
    setUserName(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTouched({ userName: true, phone: true, userType: true });

    if (!userName.trim()) {
      showMessage("Please enter your full name.", "error");
      setSubmitting(false);
      return;
    }
    if (!isValidName) {
      showMessage("Enter a valid name (2-50 letters/spaces).", "error");
      setSubmitting(false);
      return;
    }
    if (!phoneNumber) {
      showMessage("Please enter your mobile number.", "error");
      setSubmitting(false);
      return;
    }
    if (!isValidPhone) {
      showMessage("Please enter a valid 10-digit mobile number.", "error");
      setSubmitting(false);
      return;
    }
    if (!userType) {
      showMessage("Please select a user type.", "error");
      setSubmitting(false);
      return;
    }

    await setToLocalStorage("user_mobile", phoneNumber);
    dispatch(loginUser({ countryCode: "+91", phoneNumber }));
  };

  const handleUserTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUserType(e.target.value);
    setTouched((t) => ({ ...t, userType: true }));
  };

  return (
    <div
      className="min-h-screen w-full bg-white flex items-center justify-center p-4 bg-no-repeat bg-center bg-cover"
      style={{ backgroundImage: "url('/authBgImage.svg')" }}
    >
      <div className="w-full max-w-sm rounded-2xl shadow-lg border border-gray-100 text-center p-6">
        <div className="w-12 h-12 mx-auto rounded-[10px] bg-white border border-[#F0F0F0] flex items-center justify-center">
          <img
            src="/loginIcon.svg"
            alt="Login"
            className="w-5 h-5"
            loading="lazy"
          />
        </div>
        <h1 className="my-4 text-2xl font-bold text-[#2E2E2E]">R-OS</h1>
        <p className="inline-block px-[14px] py-[6px] h-[36px] rounded-full bg-[#EDEDED] text-[#757575] text-[14px] leading-[24px] font-semibold text-center">
          Register
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <div className="flex justify-start items-center border-0 border-b border-[#E0E0E0] focus:border-black focus:ring-0 focus:outline-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path
                  fill="#334054"
                  d="M4 22a8 8 0 1 1 16 0zm8-9c-3.315 0-6-2.685-6-6s2.685-6 6-6s6 2.685 6 6s-2.685 6-6 6"
                />
              </svg>
              <input
                id="userName"
                type="text"
                value={userName}
                onChange={handleUserNameChange}
                onBlur={() => setTouched((t) => ({ ...t, userName: true }))}
                placeholder="Enter Full Name"
                maxLength={50}
                className="w-full pl-9 pr-4 py-2 bg-transparent h-12  focus:border-black focus:ring-0 focus:outline-none placeholder:text-gray-400 text-sm"
                required
                autoComplete="name"
              />
            </div>
            {touched.userName && !isValidName && (
              <p className="text-xs text-red-600">
                Enter a valid name (2-50 letters/spaces).
              </p>
            )}
          </div>

          <div className="mb-6">
            <div className="relative mb-3">
              <span className="absolute left-0.5 top-1/2 -translate-y-1/2 bg-[#EDEDED] text-gray-500 text-sm rounded-[4px] px-[6px] py-[8px] leading-none h-[25px] flex items-center justify-center">
                +91
              </span>
              <input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                placeholder="Enter Mobile Number"
                maxLength={10}
                className="ml-2 w-full pl-12 pr-4 py-2 bg-transparent h-12 border-0 border-b border-[#E0E0E0] focus:border-black focus:ring-0 focus:outline-none placeholder:text-gray-400 text-sm"
                required
                autoComplete="tel"
              />
            </div>
            {touched.phone && !isValidPhone && (
              <p className="text-xs text-red-600 -mt-3">
                Please enter a valid 10-digit mobile number.
              </p>
            )}
          </div>

          {/* User Type Select using your SelectInput */}
          <div className="">
            <SelectInput
              id="userType"
              label="User Type"
              options={USER_TYPE_OPTIONS}
              value={userType}
              onChange={handleUserTypeChange}
              placeholder="Select user type"
              required
              errorMessage={
                touched.userType && !isValidUserType
                  ? "Please select a user type."
                  : undefined
              }
            />
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  {error}
                </p>
              </div>
            )}
          </div>
          <Button
            type="submit"
            disabled={
              status === "loading" ||
              submitting ||
              !isValidName ||
              !isValidPhone ||
              !isValidUserType
            }
            className="w-full h-12 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-medium flex items-center justify-center gap-2"
          >
            {status === "loading" || submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Registering...
              </>
            ) : (
              "Register"
            )}
          </Button>
        </form>

        <div className="mt-3 text-[#757575] hover:text-[#1a1a1a] font-bold">
          <a href="/login">Login</a>
        </div>

        {/* Version Info */}
        <p className="mt-3 text-xs text-gray-400">R-OS Admin v1.0.0</p>
      </div>
    </div>
  );
};
