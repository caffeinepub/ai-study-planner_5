import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface StudySession {
    id: bigint;
    topic: string;
    days: bigint;
    difficulty: string;
    quiz: string;
    concepts: string;
    studyPlan: string;
    notes: string;
    timestamp: bigint;
}
export interface backendInterface {
    deleteSession(id: bigint): Promise<boolean>;
    generateStudyContent(topic: string, difficulty: string, days: bigint): Promise<bigint>;
    getAllSessions(): Promise<Array<StudySession>>;
    getSession(id: bigint): Promise<StudySession | null>;
    getSessionCount(): Promise<bigint>;
}
