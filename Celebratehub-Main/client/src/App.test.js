import { render } from "@testing-library/react";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";

jest.mock("react-router-dom");
jest.mock("axios");
jest.mock("./components/Navbar", () => () => <div>Navbar</div>);
jest.mock("./components/Footer", () => () => <div>Footer</div>);

test("renders App", () => {
  render(
    <I18nextProvider i18n={i18n}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </I18nextProvider>
  );
});
