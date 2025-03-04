import { User } from "@/service/user";

export type AnnotatorGroup = {
  readonly id: number,
  readonly name: string,
  readonly annotators: User[]
}