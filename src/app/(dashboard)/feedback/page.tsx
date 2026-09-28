import { Metadata } from "next";
import { FeedbackTabs } from "./components/FeedbackTabs";

export const metadata: Metadata = {
  title: "Internal Feedback | OpenAgriNet",
  description: "Report internal operational issues to your supervisor, or run the Woreda issue queue.",
};

export default function FeedbackPage() {
  return (
    <div className="flex w-full flex-col gap-4">
      <FeedbackTabs />
    </div>
  );
}
