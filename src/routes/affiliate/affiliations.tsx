import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/affiliate/affiliations")({ beforeLoad: () => { throw redirect({ to: "/affiliate/my-affiliations" }); } });
