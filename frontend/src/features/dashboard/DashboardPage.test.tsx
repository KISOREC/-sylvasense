import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DashboardPage } from "./DashboardPage";

describe("DashboardPage", () => {
  it("labels the initial workspace as having no monitoring data", () => {
    render(<DashboardPage />);
    expect(screen.getByRole("heading", { name: "SYLVASENSE" })).toBeInTheDocument();
    expect(screen.getByText("No monitoring data configured")).toBeInTheDocument();
    expect(screen.getByText(/not proof of illegal activity/)).toBeInTheDocument();
  });
});
