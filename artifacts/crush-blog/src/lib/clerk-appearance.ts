import { shadcn } from "@clerk/themes";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "#c33a32",
    colorForeground: "#24211e",
    colorMutedForeground: "#756f65",
    colorBackground: "#fffdf9",
    colorInput: "#fffdf9",
    colorInputForeground: "#24211e",
    colorDanger: "#a73630",
    colorNeutral: "#24211e",
    fontFamily: "DM Sans, sans-serif",
    borderRadius: "12px",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox:
      "bg-[#fffdf9] border border-[#ded8ce] rounded-xl shadow-sm w-[440px] max-w-full overflow-hidden",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-[#24211e] font-extrabold tracking-tight",
    headerSubtitle: "text-[#756f65]",
    socialButtonsBlockButtonText: "text-[#24211e] font-semibold",
    formFieldLabel: "text-[#24211e] font-semibold",
    footerActionLink: "text-[#a73630] font-semibold",
    footerActionText: "text-[#756f65]",
    dividerText: "text-[#756f65]",
    identityPreviewEditButton: "text-[#a73630]",
    formFieldSuccessText: "text-[#506344]",
    alertText: "text-[#24211e]",
    logoBox: "mb-2",
    logoImage: "max-h-10",
    socialButtonsBlockButton:
      "border-[#ded8ce] bg-white hover:bg-[#f8f6f1]",
    formButtonPrimary: "bg-[#c33a32] text-white hover:bg-[#a72f29]",
    formFieldInput:
      "border-[#d9d4ca] bg-[#fffdf9] text-[#24211e] shadow-none focus:ring-[#c33a32]/20",
    footerAction: "text-[#756f65]",
    dividerLine: "bg-[#ded8ce]",
    alert: "border-[#ded8ce] bg-[#f8f6f1]",
    otpCodeFieldInput: "border-[#d9d4ca] bg-white text-[#24211e]",
    formFieldRow: "text-[#24211e]",
    main: "text-[#24211e]",
  },
};
