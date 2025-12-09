import { render } from "@testing-library/react";
import App from "./App";
import { BrowserRouter } from "react-router-dom";

jest.mock("react-router-dom");
jest.mock("axios");
jest.mock("./components/Navbar", () => () => <div>Navbar</div>);
jest.mock("./components/Footer", () => () => <div>Footer</div>);

test("renders App", () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
});
