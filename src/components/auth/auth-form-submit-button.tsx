import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type AuthFormSubmitButtonProps = {
  children: React.ReactNode;
  loading?: boolean;
  loadingText?: string;
};

export function AuthFormSubmitButton({
  children,
  loading,
  loadingText,
}: AuthFormSubmitButtonProps) {
  return (
    <Button
      type="submit"
      className="w-55 uppercase"
      disabled={loading}
      style={{
        boxShadow:
          "0 1px 5px 0 rgba(0,0,0,0.12),0 2px 2px 0 rgba(0,0,0,0.14),0 3px 1px -2px rgba(0,0,0,0.2)",
      }}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 size-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
