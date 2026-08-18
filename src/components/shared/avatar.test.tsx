import { fireEvent, render, screen } from "@testing-library/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function renderAvatar(src?: string) {
  return render(
    <Avatar>
      <AvatarImage src={src} />
      <AvatarFallback>AB</AvatarFallback>
    </Avatar>,
  );
}

describe("AvatarImage", () => {
  it("renders the three-dot loading indicator while the image is pending", () => {
    const { container } = renderAvatar("/avatar.png");

    const loading = container.querySelector('[data-slot="avatar-loading"]');
    expect(loading).not.toBeNull();
    expect(loading!.querySelectorAll("span")).toHaveLength(3);

    const img = container.querySelector('img[data-slot="avatar-image"]') as HTMLImageElement;
    expect(img).not.toBeNull();
    expect(img.className).toContain("opacity-0");
  });

  it("removes the loading indicator once the image has loaded", () => {
    const { container } = renderAvatar("/avatar.png");

    fireEvent.load(container.querySelector('img[data-slot="avatar-image"]')!);

    expect(container.querySelector('[data-slot="avatar-loading"]')).toBeNull();
    expect(
      (container.querySelector('img[data-slot="avatar-image"]') as HTMLImageElement).className,
    ).not.toContain("opacity-0");
  });

  it("falls back to the initials on image error instead of leaving the dots", () => {
    const { container } = renderAvatar("/broken.png");

    fireEvent.error(container.querySelector('img[data-slot="avatar-image"]')!);

    expect(container.querySelector('[data-slot="avatar-loading"]')).toBeNull();
    expect(container.querySelector('img[data-slot="avatar-image"]')).toBeNull();
    expect(screen.getByText("AB")).toBeInTheDocument();
  });

  it("shows no loading indicator when there is no avatar source", () => {
    const { container } = renderAvatar();

    expect(container.querySelector('[data-slot="avatar-loading"]')).toBeNull();
    expect(container.querySelector('img[data-slot="avatar-image"]')).toBeNull();
    expect(screen.getByText("AB")).toBeInTheDocument();
  });
});
