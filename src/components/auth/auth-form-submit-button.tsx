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
    <Button type="submit" className="w-55 uppercase shadow-solid" disabled={loading}>
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
