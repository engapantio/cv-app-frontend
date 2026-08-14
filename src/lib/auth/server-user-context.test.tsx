import { render, screen } from "@testing-library/react";
import { ServerUserProvider, useServerUser } from "./server-user-context";

function Probe({ label }: { label: string }) {
  const user = useServerUser();
  return (
    <span>
      {label}:{user ? user.id : "none"}
    </span>
  );
}

describe("ServerUserProvider / useServerUser", () => {
  it("provides the user to consumers", () => {
    render(
      <ServerUserProvider user={{ id: "u1" } as never}>
        <Probe label="a" />
      </ServerUserProvider>,
    );
    expect(screen.getByText("a:u1")).toBeInTheDocument();
  });

  it("exposes null when no user is injected", () => {
    render(
      <ServerUserProvider user={null}>
        <Probe label="a" />
      </ServerUserProvider>,
    );
    expect(screen.getByText("a:none")).toBeInTheDocument();
  });

  it("returns undefined outside a provider", () => {
    render(<Probe label="a" />);
    expect(screen.getByText("a:none")).toBeInTheDocument();
  });
});
