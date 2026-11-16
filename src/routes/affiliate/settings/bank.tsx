import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/affiliate/settings/bank")({ beforeLoad: () => { throw redirect({ to: "/affiliate/settings/bank-account" }); } });
