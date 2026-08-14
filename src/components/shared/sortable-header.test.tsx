import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SortableHeader } from "./sortable-header";

jest.mock("lucide-react", () => require("@/test-utils/mocks").mockLucide());

function makeColumn(sorted: "" | "asc" | "desc" | false | undefined) {
  return {
    getIsSorted: () => sorted,
    getToggleSortingHandler: () => jest.fn(),
  } as never;
}

describe("SortableHeader", () => {
  it("renders the label", () => {
    render(<SortableHeader column={makeColumn("")} label="Name" />);
    expect(screen.getByRole("button", { name: "Name" })).toBeInTheDocument();
  });

  it("invokes the sorting handler on click", async () => {
    const user = userEvent.setup();
    const handler = jest.fn();
    render(
      <SortableHeader
        column={{ getIsSorted: () => "", getToggleSortingHandler: () => handler } as never}
        label="Name"
      />,
    );
    await user.click(screen.getByRole("button", { name: "Name" }));
    expect(handler).toHaveBeenCalled();
  });
});
