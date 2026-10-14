import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCourse } from "@/features/performance";
import { CourseDetails } from "./components/CourseDetails";

export async function generateMetadata(props: PageProps<"/training/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const course = getCourse(id);
  return { title: course ? `${course.title} | OpenAgriNet` : "Course not found | OpenAgriNet" };
}

export default async function CourseDetailsPage(props: PageProps<"/training/[id]">) {
  const { id } = await props.params;
  const course = getCourse(id);
  if (!course) notFound();
  return <CourseDetails course={course} />;
}
