import { render } from "@testing-library/react";
import { GlobalLoader } from "./global-loader";

jest.mock("lucide-react", () => require("@/test-utils/mocks").mockLucide());

describe("GlobalLoader", () => {
  it("renders the loader container", () => {
    const { container } = render(<GlobalLoader />);
    expect(container).not.toBeEmptyDOMElement();
  });
});
