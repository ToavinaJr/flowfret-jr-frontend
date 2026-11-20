/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type AddTrackToPlaylistInput = {
  readonly playlistId: string;
  readonly track: TrackSnapshotInput;
};

export type AdminAuditInput = {
  readonly action: string | null | undefined;
  readonly actorId: string | null | undefined;
  readonly after: string | null | undefined;
  readonly direction: AdminSortDirection;
  readonly entityType: string | null | undefined;
  readonly first: number;
  readonly from: string | null | undefined;
  readonly includeDeleted: boolean;
  readonly search: string | null | undefined;
  readonly to: string | null | undefined;
};

export type AdminContentInput = {
  readonly after: string | null | undefined;
  readonly commentStatus: CommentStatus | null | undefined;
  readonly direction: AdminSortDirection;
  readonly first: number;
  readonly from: string | null | undefined;
  readonly includeDeleted: boolean;
  readonly postStatus: PostStatus | null | undefined;
  readonly reportStatus: ReportStatus | null | undefined;
  readonly search: string | null | undefined;
  readonly to: string | null | undefined;
};

export type AdminManagedEntity =
  | 'CATALOG_TRACK'
  | 'CHORD_TRANSCRIPTION'
  | 'COMMENT'
  | 'COMMENT_MENTION'
  | 'FRIENDSHIP'
  | 'LISTENING_HISTORY'
  | 'NOTIFICATION'
  | 'NOTIFICATION_PREFERENCE'
  | 'PLAYLIST'
  | 'PLAYLIST_ITEM'
  | 'POST'
  | 'POST_ATTACHMENT'
  | 'POST_LIKE'
  | 'POST_MENTION'
  | 'POST_REPORT'
  | 'PROFILE'
  | 'TRANSCRIPTION'
  | 'TRANSCRIPTION_ACCESS'
  | 'UPLOAD'
  | 'USER';

export type AdminManagedEntityListInput = {
  readonly entity: AdminManagedEntity;
  readonly first: number;
  readonly from: string | null | undefined;
  readonly includeDeleted: boolean;
  readonly skip: number;
  readonly to: string | null | undefined;
};

export type AdminManagedEntityMutationInput = {
  readonly data: unknown;
  readonly entity: AdminManagedEntity;
  readonly reason: string;
  readonly recordId: string | null | undefined;
};

export type AdminMediaInput = {
  readonly after: string | null | undefined;
  readonly direction: AdminSortDirection;
  readonly first: number;
  readonly from: string | null | undefined;
  readonly includeDeleted: boolean;
  readonly provider: MusicProvider | null | undefined;
  readonly search: string | null | undefined;
  readonly to: string | null | undefined;
  readonly transcriptionStatus: TranscriptionStatus | null | undefined;
  readonly uploadStatus: UploadStatus | null | undefined;
};

export type AdminModerateReportInput = {
  readonly reason: string;
  readonly reportId: string;
  readonly status: ReportStatus;
};

export type AdminMusicInput = {
  readonly after: string | null | undefined;
  readonly direction: AdminSortDirection;
  readonly first: number;
  readonly from: string | null | undefined;
  readonly includeDeleted: boolean;
  readonly provider: MusicProvider | null | undefined;
  readonly search: string | null | undefined;
  readonly to: string | null | undefined;
  readonly userId: string | null | undefined;
};

export type AdminSetUserRoleInput = {
  readonly reason: string;
  readonly role: UserRole;
  readonly userId: string;
};

export type AdminSetUserStatusInput = {
  readonly reason: string;
  readonly status: UserStatus;
  readonly userId: string;
};

export type AdminSortDirection =
  | 'ASC'
  | 'DESC';

export type AdminStatisticsInput = {
  readonly days: number;
};

export type AdminUserActionInput = {
  readonly reason: string;
  readonly userId: string;
};

export type AdminUserSortField =
  | 'CREATED_AT'
  | 'EMAIL'
  | 'LAST_LOGIN_AT'
  | 'UPDATED_AT'
  | 'USERNAME';

export type AdminUsersInput = {
  readonly after: string | null | undefined;
  readonly direction: AdminSortDirection;
  readonly first: number;
  readonly from: string | null | undefined;
  readonly includeDeleted: boolean;
  readonly role: UserRole | null | undefined;
  readonly search: string | null | undefined;
  readonly sortBy: AdminUserSortField;
  readonly status: UserStatus | null | undefined;
  readonly to: string | null | undefined;
};

export type ChangePasswordInput = {
  readonly currentPassword: string;
  readonly newPassword: string;
};

export type ChordCueInput = {
  readonly chord: string;
  readonly end: number;
  readonly start: number;
};

export type CommentStatus =
  | 'ACTIVE'
  | 'DELETED'
  | 'HIDDEN';

export type ConversationParticipantRole =
  | 'ADMIN'
  | 'MEMBER';

export type ConversationType =
  | 'DIRECT'
  | 'GROUP';

export type CreateCommentInput = {
  readonly content: string;
  readonly postId: string;
  readonly status: CommentStatus | null | undefined;
};

export type CreatePlaylistInput = {
  readonly coverUrl: string | null | undefined;
  readonly description: string | null | undefined;
  readonly name: string;
  readonly visibility: PlaylistVisibility | null | undefined;
};

export type CreatePostInput = {
  readonly audioUrl: string | null | undefined;
  readonly content: string | null | undefined;
  readonly coverImageUrl: string | null | undefined;
  readonly imageUploadIds: ReadonlyArray<string> | null | undefined;
  readonly status: PostStatus | null | undefined;
  readonly visibility: PostVisibility | null | undefined;
};

export type CreateProfileInput = {
  readonly avatarUrl: string | null | undefined;
  readonly bio: string | null | undefined;
  readonly displayName: string;
  readonly level: string | null | undefined;
  readonly location: string | null | undefined;
  readonly visibility: ProfileVisibility | null | undefined;
  readonly websiteUrl: string | null | undefined;
};

export type CreateTeachingCourseInput = {
  readonly description: string | null | undefined;
  readonly durationMinutes: number;
  readonly format: TeachingCourseFormat | null | undefined;
  readonly level: string | null | undefined;
  readonly maxStudents: number | null | undefined;
  readonly priceAmount: number;
  readonly priceCurrency: string;
  readonly priceUnit: TeachingPriceUnit | null | undefined;
  readonly status: TeachingCourseStatus | null | undefined;
  readonly teachingMode: TeachingMode | null | undefined;
  readonly title: string;
};

export type DeleteAccountInput = {
  readonly confirmation: string;
  readonly currentPassword: string | null | undefined;
};

export type FriendshipStatus =
  | 'ACCEPTED'
  | 'BLOCKED'
  | 'CANCELED'
  | 'PENDING'
  | 'REJECTED';

export type GoogleAuthInput = {
  readonly accessToken: string;
};

export type InstructorStatus =
  | 'APPROVED'
  | 'PENDING'
  | 'REJECTED'
  | 'SUSPENDED';

export type LessonAttendanceInput = {
  readonly note: string | null | undefined;
  readonly status: LessonAttendanceStatus;
};

export type LessonAttendanceStatus =
  | 'ABSENT'
  | 'EXCUSED'
  | 'EXPECTED'
  | 'PRESENT';

export type ListeningArtistInput = {
  readonly id: string;
  readonly name: string;
};

export type LoginInput = {
  readonly email: string;
  readonly password: string;
};

export type MusicProvider =
  | 'AUDIUS'
  | 'SPOTIFY'
  | 'YOUTUBE';

export type NotificationType =
  | 'CHAT_MESSAGE'
  | 'COMMENT_CREATED'
  | 'FOLLOWED_POST_ACTIVITY'
  | 'FRIEND_ACCEPTED'
  | 'FRIEND_POST'
  | 'FRIEND_REQUEST'
  | 'POST_COMMENT'
  | 'POST_CREATED'
  | 'POST_LIKE'
  | 'SYSTEM'
  | 'TEACHING_COURSE_INVITATION'
  | 'TEACHING_ENROLLMENT_REQUEST'
  | 'TEACHING_ENROLLMENT_UPDATED'
  | 'TEACHING_LESSON_CANCELLED'
  | 'TEACHING_LESSON_COMPLETED'
  | 'TEACHING_LESSON_REMINDER'
  | 'TEACHING_LESSON_RESCHEDULED'
  | 'TEACHING_LESSON_SCHEDULED'
  | 'UPLOAD_READY';

export type PlaylistArtistInput = {
  readonly id: string;
  readonly name: string;
};

export type PlaylistVisibility =
  | 'FRIENDS'
  | 'PRIVATE'
  | 'PUBLIC';

export type PostStatus =
  | 'ACTIVE'
  | 'DELETED'
  | 'HIDDEN';

export type PostVisibility =
  | 'FRIENDS'
  | 'PRIVATE'
  | 'PUBLIC';

export type ProfileVisibility =
  | 'FRIENDS'
  | 'PRIVATE'
  | 'PUBLIC';

export type RecordTrackListenInput = {
  readonly album: string | null | undefined;
  readonly artists: ReadonlyArray<ListeningArtistInput>;
  readonly durationMs: number;
  readonly externalUrl: string;
  readonly genre: string | null | undefined;
  readonly imageUrl: string | null | undefined;
  readonly isrc: string | null | undefined;
  readonly provider: MusicProvider;
  readonly providerTrackId: string;
  readonly streamUrl: string;
  readonly title: string;
};

export type RegisterInput = {
  readonly email: string;
  readonly password: string;
  readonly username: string;
};

export type ReorderPlaylistItemsInput = {
  readonly expectedVersion: number;
  readonly orderedItemIds: ReadonlyArray<string>;
  readonly playlistId: string;
};

export type ReportStatus =
  | 'DISMISSED'
  | 'OPEN'
  | 'RESOLVED'
  | 'REVIEWED';

export type RequestPasswordResetInput = {
  readonly email: string;
};

export type ResetPasswordInput = {
  readonly password: string;
  readonly token: string;
};

export type SaveChordTranscriptionInput = {
  readonly artist: string | null | undefined;
  readonly cues: ReadonlyArray<ChordCueInput>;
  readonly duration: number;
  readonly engineVersion: string;
  readonly provider: MusicProvider;
  readonly providerTrackId: string;
  readonly title: string | null | undefined;
};

export type TeachingCourseFormat =
  | 'GROUP'
  | 'INDIVIDUAL';

export type TeachingCourseStatus =
  | 'ARCHIVED'
  | 'DRAFT'
  | 'PUBLISHED';

export type TeachingEnrollmentStatus =
  | 'ACTIVE'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'INVITED'
  | 'PAUSED'
  | 'REQUESTED';

export type TeachingLessonInput = {
  readonly location: string | null | undefined;
  readonly meetingUrl: string | null | undefined;
  readonly startsAt: unknown;
  readonly teachingMode: TeachingMode | null | undefined;
  readonly timeZone: string;
};

export type TeachingLessonStatus =
  | 'CANCELLED'
  | 'COMPLETED'
  | 'SCHEDULED';

export type TeachingMode =
  | 'HYBRID'
  | 'IN_PERSON'
  | 'ONLINE';

export type TeachingPriceUnit =
  | 'PER_COURSE'
  | 'PER_LESSON';

export type TrackSnapshotInput = {
  readonly album: string | null | undefined;
  readonly artists: ReadonlyArray<PlaylistArtistInput>;
  readonly durationMs: number;
  readonly externalUrl: string;
  readonly genre: string | null | undefined;
  readonly imageUrl: string | null | undefined;
  readonly isrc: string | null | undefined;
  readonly provider: MusicProvider;
  readonly providerTrackId: string;
  readonly title: string;
};

export type TranscriptionStatus =
  | 'COMPLETED'
  | 'DOWNLOADING'
  | 'FAILED'
  | 'PENDING'
  | 'PROCESSING'
  | 'READY_TO_PLAY';

export type UpdateCommentInput = {
  readonly content: string | null | undefined;
  readonly postId: string | null | undefined;
  readonly status: CommentStatus | null | undefined;
};

export type UpdatePlaylistInput = {
  readonly coverUrl: string | null | undefined;
  readonly description: string | null | undefined;
  readonly name: string | null | undefined;
  readonly visibility: PlaylistVisibility | null | undefined;
};

export type UpdatePostInput = {
  readonly audioUrl: string | null | undefined;
  readonly content: string | null | undefined;
  readonly coverImageUrl: string | null | undefined;
  readonly imageUploadIds: ReadonlyArray<string> | null | undefined;
  readonly status: PostStatus | null | undefined;
  readonly visibility: PostVisibility | null | undefined;
};

export type UpdatePostReportInput = {
  readonly reason: string | null | undefined;
  readonly reviewedAt: unknown;
  readonly status: ReportStatus | null | undefined;
};

export type UpdateProfileInput = {
  readonly avatarUrl: string | null | undefined;
  readonly bio: string | null | undefined;
  readonly displayName: string | null | undefined;
  readonly level: string | null | undefined;
  readonly location: string | null | undefined;
  readonly visibility: ProfileVisibility | null | undefined;
  readonly websiteUrl: string | null | undefined;
};

export type UpdateTeachingCourseInput = {
  readonly description: string | null | undefined;
  readonly durationMinutes: number | null | undefined;
  readonly format: TeachingCourseFormat | null | undefined;
  readonly level: string | null | undefined;
  readonly maxStudents: number | null | undefined;
  readonly priceAmount: number | null | undefined;
  readonly priceCurrency: string | null | undefined;
  readonly priceUnit: TeachingPriceUnit | null | undefined;
  readonly status: TeachingCourseStatus | null | undefined;
  readonly teachingMode: TeachingMode | null | undefined;
  readonly title: string | null | undefined;
};

export type UpdateTeachingEnrollmentInput = {
  readonly status: TeachingEnrollmentStatus;
};

export type UploadSourceType =
  | 'COURSE_MATERIAL'
  | 'MESSAGE'
  | 'OTHER'
  | 'POST'
  | 'PROFILE';

export type UploadStatus =
  | 'AVAILABLE'
  | 'DELETED'
  | 'FAILED'
  | 'PROCESSING'
  | 'UPLOADED';

export type UpsertInstructorProfileInput = {
  readonly biography: string | null | undefined;
  readonly experienceYears: number | null | undefined;
  readonly headline: string | null | undefined;
  readonly languages: ReadonlyArray<string> | null | undefined;
  readonly specialties: ReadonlyArray<string> | null | undefined;
};

export type UserRole =
  | 'ADMIN'
  | 'USER';

export type UserStatus =
  | 'ACTIVE'
  | 'DELETED'
  | 'PENDING'
  | 'SUSPENDED';

export type VerifyEmailInput = {
  readonly code: string;
  readonly token: string;
};

export type AdminInstructorProfilesQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminInstructorProfilesQuery = { readonly adminInstructorProfiles: ReadonlyArray<{ readonly id: string, readonly userId: string, readonly status: InstructorStatus, readonly headline: string | null, readonly biography: string | null, readonly experienceYears: number | null, readonly specialties: ReadonlyArray<string>, readonly languages: ReadonlyArray<string>, readonly storageQuotaBytes: string }> };

export type AdminManagedEntityMutationVariables = Exact<{
  input: AdminManagedEntityMutationInput;
}>;


export type AdminManagedEntityMutation = { readonly adminCreateManagedEntity: unknown };

export type SetAvatarMutationVariables = Exact<{
  id: string;
  data: UpdateProfileInput;
}>;


export type SetAvatarMutation = { readonly updateProfile: { readonly id: string } };

export type CreateProfileFromDynamicField100MutationVariables = Exact<{
  data: CreateProfileInput;
}>;


export type CreateProfileFromDynamicField100Mutation = { readonly createProfile: { readonly id: string } };

export type CourseMaterialsQueryVariables = Exact<{
  courseId: string;
}>;


export type CourseMaterialsQuery = { readonly teachingCourseMaterials: ReadonlyArray<{ readonly id: string, readonly courseId: string, readonly lessonId: string | null, readonly title: string, readonly fileName: string, readonly fileType: string, readonly fileSize: string, readonly createdAt: unknown }> };

export type LessonMaterialsQueryVariables = Exact<{
  lessonId: string;
}>;


export type LessonMaterialsQuery = { readonly teachingLessonMaterials: ReadonlyArray<{ readonly id: string, readonly courseId: string, readonly lessonId: string | null, readonly title: string, readonly fileName: string, readonly fileType: string, readonly fileSize: string, readonly createdAt: unknown }> };

export type TeachingMaterialsQueryVariables = Exact<{
  courseIds: ReadonlyArray<string> | string;
}>;


export type TeachingMaterialsQuery = { readonly teachingMaterialsForCourses: ReadonlyArray<{ readonly id: string, readonly courseId: string, readonly lessonId: string | null, readonly title: string, readonly fileName: string, readonly fileType: string, readonly fileSize: string, readonly createdAt: unknown }> };

export type DeleteTeachingMaterialMutationVariables = Exact<{
  id: string;
}>;


export type DeleteTeachingMaterialMutation = { readonly deleteTeachingMaterial: boolean };

export type TeachingWorkspaceQueryVariables = Exact<{ [key: string]: never; }>;


export type TeachingWorkspaceQuery = { readonly myInstructorProfile: { readonly id: string, readonly userId: string, readonly status: InstructorStatus, readonly headline: string | null, readonly biography: string | null, readonly experienceYears: number | null, readonly specialties: ReadonlyArray<string>, readonly languages: ReadonlyArray<string> } | null, readonly myTeachingCourses: ReadonlyArray<{ readonly id: string, readonly instructorId: string, readonly title: string, readonly description: string | null, readonly level: string | null, readonly format: TeachingCourseFormat, readonly maxStudents: number, readonly reservedSeats: number, readonly teachingMode: TeachingMode, readonly priceAmount: number, readonly priceCurrency: string, readonly priceUnit: TeachingPriceUnit, readonly durationMinutes: number, readonly status: TeachingCourseStatus }>, readonly myEnrolledTeachingCourses: ReadonlyArray<{ readonly id: string, readonly instructorId: string, readonly title: string, readonly description: string | null, readonly level: string | null, readonly format: TeachingCourseFormat, readonly maxStudents: number, readonly reservedSeats: number, readonly teachingMode: TeachingMode, readonly priceAmount: number, readonly priceCurrency: string, readonly priceUnit: TeachingPriceUnit, readonly durationMinutes: number, readonly status: TeachingCourseStatus }>, readonly publishedTeachingCourses: ReadonlyArray<{ readonly id: string, readonly instructorId: string, readonly title: string, readonly description: string | null, readonly level: string | null, readonly format: TeachingCourseFormat, readonly maxStudents: number, readonly reservedSeats: number, readonly teachingMode: TeachingMode, readonly priceAmount: number, readonly priceCurrency: string, readonly priceUnit: TeachingPriceUnit, readonly durationMinutes: number, readonly status: TeachingCourseStatus }>, readonly myTeachingEnrollments: ReadonlyArray<{ readonly id: string, readonly courseId: string, readonly studentId: string, readonly status: TeachingEnrollmentStatus, readonly courseTitle: string | null, readonly instructorUsername: string | null, readonly studentUsername: string | null, readonly invitedAt: unknown, readonly acceptedAt: unknown, readonly endedAt: unknown }>, readonly myTeachingCourseEnrollments: ReadonlyArray<{ readonly id: string, readonly courseId: string, readonly studentId: string, readonly status: TeachingEnrollmentStatus, readonly courseTitle: string | null, readonly instructorUsername: string | null, readonly studentUsername: string | null, readonly invitedAt: unknown, readonly acceptedAt: unknown, readonly endedAt: unknown }> };

export type InviteStudentToTeachingCourseMutationVariables = Exact<{
  courseId: string;
  studentId: string;
}>;


export type InviteStudentToTeachingCourseMutation = { readonly inviteStudentToTeachingCourse: { readonly id: string, readonly courseId: string, readonly studentId: string, readonly status: TeachingEnrollmentStatus, readonly courseTitle: string | null, readonly instructorUsername: string | null, readonly studentUsername: string | null, readonly invitedAt: unknown, readonly acceptedAt: unknown, readonly endedAt: unknown } };

export type UpdateTeachingEnrollmentMutationVariables = Exact<{
  id: string;
  data: UpdateTeachingEnrollmentInput;
}>;


export type UpdateTeachingEnrollmentMutation = { readonly updateTeachingEnrollment: { readonly id: string, readonly courseId: string, readonly studentId: string, readonly status: TeachingEnrollmentStatus, readonly courseTitle: string | null, readonly instructorUsername: string | null, readonly studentUsername: string | null, readonly invitedAt: unknown, readonly acceptedAt: unknown, readonly endedAt: unknown } };

export type RespondToTeachingInvitationMutationVariables = Exact<{
  enrollmentId: string;
  accept: boolean;
}>;


export type RespondToTeachingInvitationMutation = { readonly respondToTeachingCourseInvitation: { readonly id: string, readonly courseId: string, readonly studentId: string, readonly status: TeachingEnrollmentStatus } };

export type AdminManagedEntityFromDynamicField10MutationVariables = Exact<{
  input: AdminManagedEntityMutationInput;
}>;


export type AdminManagedEntityFromDynamicField10Mutation = { readonly adminUpdateManagedEntity: unknown };

export type SaveInstructorProfileMutationVariables = Exact<{
  data: UpsertInstructorProfileInput;
}>;


export type SaveInstructorProfileMutation = { readonly upsertInstructorProfile: { readonly id: string, readonly userId: string, readonly status: InstructorStatus, readonly headline: string | null, readonly biography: string | null, readonly experienceYears: number | null, readonly specialties: ReadonlyArray<string>, readonly languages: ReadonlyArray<string> } };

export type CreateTeachingCourseMutationVariables = Exact<{
  data: CreateTeachingCourseInput;
}>;


export type CreateTeachingCourseMutation = { readonly createTeachingCourse: { readonly id: string, readonly instructorId: string, readonly title: string, readonly description: string | null, readonly level: string | null, readonly format: TeachingCourseFormat, readonly maxStudents: number, readonly reservedSeats: number, readonly teachingMode: TeachingMode, readonly priceAmount: number, readonly priceCurrency: string, readonly priceUnit: TeachingPriceUnit, readonly durationMinutes: number, readonly status: TeachingCourseStatus } };

export type UpdateTeachingCourseMutationVariables = Exact<{
  id: string;
  data: UpdateTeachingCourseInput;
}>;


export type UpdateTeachingCourseMutation = { readonly updateTeachingCourse: { readonly id: string, readonly instructorId: string, readonly title: string, readonly description: string | null, readonly level: string | null, readonly format: TeachingCourseFormat, readonly maxStudents: number, readonly reservedSeats: number, readonly teachingMode: TeachingMode, readonly priceAmount: number, readonly priceCurrency: string, readonly priceUnit: TeachingPriceUnit, readonly durationMinutes: number, readonly status: TeachingCourseStatus } };

export type ArchiveTeachingCourseMutationVariables = Exact<{
  id: string;
}>;


export type ArchiveTeachingCourseMutation = { readonly archiveTeachingCourse: { readonly id: string, readonly instructorId: string, readonly title: string, readonly description: string | null, readonly level: string | null, readonly format: TeachingCourseFormat, readonly maxStudents: number, readonly reservedSeats: number, readonly teachingMode: TeachingMode, readonly priceAmount: number, readonly priceCurrency: string, readonly priceUnit: TeachingPriceUnit, readonly durationMinutes: number, readonly status: TeachingCourseStatus } };

export type RequestTeachingEnrollmentMutationVariables = Exact<{
  courseId: string;
}>;


export type RequestTeachingEnrollmentMutation = { readonly requestTeachingCourseEnrollment: { readonly id: string } };

export type MyTeachingLessonsQueryVariables = Exact<{
  from: unknown;
  to: unknown;
}>;


export type MyTeachingLessonsQuery = { readonly myTeachingLessons: ReadonlyArray<{ readonly id: string, readonly courseId: string, readonly createdById: string, readonly courseTitle: string, readonly startsAt: unknown, readonly endsAt: unknown, readonly timeZone: string, readonly teachingMode: TeachingMode, readonly location: string | null, readonly meetingUrl: string | null, readonly status: TeachingLessonStatus, readonly cancellationNote: string | null, readonly attendances: ReadonlyArray<{ readonly id: string, readonly enrollmentId: string, readonly status: LessonAttendanceStatus, readonly note: string | null, readonly studentUsername: string | null }> }> };

export type ScheduleTeachingLessonMutationVariables = Exact<{
  courseId: string;
  data: TeachingLessonInput;
}>;


export type ScheduleTeachingLessonMutation = { readonly scheduleTeachingLesson: { readonly id: string, readonly courseId: string, readonly createdById: string, readonly courseTitle: string, readonly startsAt: unknown, readonly endsAt: unknown, readonly timeZone: string, readonly teachingMode: TeachingMode, readonly location: string | null, readonly meetingUrl: string | null, readonly status: TeachingLessonStatus, readonly cancellationNote: string | null, readonly attendances: ReadonlyArray<{ readonly id: string, readonly enrollmentId: string, readonly status: LessonAttendanceStatus, readonly note: string | null, readonly studentUsername: string | null }> } };

export type ScheduleTeachingLessonSeriesMutationVariables = Exact<{
  courseId: string;
  data: TeachingLessonInput;
  occurrences: number;
}>;


export type ScheduleTeachingLessonSeriesMutation = { readonly scheduleTeachingLessonSeries: ReadonlyArray<{ readonly id: string, readonly courseId: string, readonly createdById: string, readonly courseTitle: string, readonly startsAt: unknown, readonly endsAt: unknown, readonly timeZone: string, readonly teachingMode: TeachingMode, readonly location: string | null, readonly meetingUrl: string | null, readonly status: TeachingLessonStatus, readonly cancellationNote: string | null, readonly attendances: ReadonlyArray<{ readonly id: string, readonly enrollmentId: string, readonly status: LessonAttendanceStatus, readonly note: string | null, readonly studentUsername: string | null }> }> };

export type RescheduleTeachingLessonMutationVariables = Exact<{
  id: string;
  data: TeachingLessonInput;
}>;


export type RescheduleTeachingLessonMutation = { readonly rescheduleTeachingLesson: { readonly id: string, readonly courseId: string, readonly createdById: string, readonly courseTitle: string, readonly startsAt: unknown, readonly endsAt: unknown, readonly timeZone: string, readonly teachingMode: TeachingMode, readonly location: string | null, readonly meetingUrl: string | null, readonly status: TeachingLessonStatus, readonly cancellationNote: string | null, readonly attendances: ReadonlyArray<{ readonly id: string, readonly enrollmentId: string, readonly status: LessonAttendanceStatus, readonly note: string | null, readonly studentUsername: string | null }> } };

export type CancelTeachingLessonMutationVariables = Exact<{
  id: string;
  note: string | null | undefined;
}>;


export type CancelTeachingLessonMutation = { readonly cancelTeachingLesson: { readonly id: string, readonly courseId: string, readonly createdById: string, readonly courseTitle: string, readonly startsAt: unknown, readonly endsAt: unknown, readonly timeZone: string, readonly teachingMode: TeachingMode, readonly location: string | null, readonly meetingUrl: string | null, readonly status: TeachingLessonStatus, readonly cancellationNote: string | null, readonly attendances: ReadonlyArray<{ readonly id: string, readonly enrollmentId: string, readonly status: LessonAttendanceStatus, readonly note: string | null, readonly studentUsername: string | null }> } };

export type AdminManagedEntityFromDynamicField11MutationVariables = Exact<{
  input: AdminManagedEntityMutationInput;
}>;


export type AdminManagedEntityFromDynamicField11Mutation = { readonly adminDeleteManagedEntity: unknown };

export type CompleteTeachingLessonMutationVariables = Exact<{
  id: string;
}>;


export type CompleteTeachingLessonMutation = { readonly completeTeachingLesson: { readonly id: string, readonly courseId: string, readonly createdById: string, readonly courseTitle: string, readonly startsAt: unknown, readonly endsAt: unknown, readonly timeZone: string, readonly teachingMode: TeachingMode, readonly location: string | null, readonly meetingUrl: string | null, readonly status: TeachingLessonStatus, readonly cancellationNote: string | null, readonly attendances: ReadonlyArray<{ readonly id: string, readonly enrollmentId: string, readonly status: LessonAttendanceStatus, readonly note: string | null, readonly studentUsername: string | null }> } };

export type MarkLessonAttendanceMutationVariables = Exact<{
  lessonId: string;
  enrollmentId: string;
  data: LessonAttendanceInput;
}>;


export type MarkLessonAttendanceMutation = { readonly markLessonAttendance: { readonly id: string, readonly courseId: string, readonly createdById: string, readonly courseTitle: string, readonly startsAt: unknown, readonly endsAt: unknown, readonly timeZone: string, readonly teachingMode: TeachingMode, readonly location: string | null, readonly meetingUrl: string | null, readonly status: TeachingLessonStatus, readonly cancellationNote: string | null, readonly attendances: ReadonlyArray<{ readonly id: string, readonly enrollmentId: string, readonly status: LessonAttendanceStatus, readonly note: string | null, readonly studentUsername: string | null }> } };

export type AdminManagedEntityFromDynamicField12MutationVariables = Exact<{
  input: AdminManagedEntityMutationInput;
}>;


export type AdminManagedEntityFromDynamicField12Mutation = { readonly adminRestoreManagedEntity: unknown };

export type AdminDashboardStatisticsQueryVariables = Exact<{
  input: AdminStatisticsInput | null | undefined;
}>;


export type AdminDashboardStatisticsQuery = { readonly adminDashboardStatistics: { readonly generatedAt: unknown, readonly periodStart: unknown, readonly periodEnd: unknown, readonly days: number, readonly totals: { readonly users: number, readonly activeUsers: number, readonly posts: number, readonly comments: number, readonly openReports: number, readonly uploads: number, readonly transcriptions: number, readonly chordTranscriptions: number, readonly playlists: number, readonly catalogTracks: number, readonly trackPlays: number }, readonly period: { readonly newUsers: number, readonly newPosts: number, readonly newComments: number, readonly newUploads: number, readonly newTranscriptions: number, readonly reportsCreated: number, readonly trackPlays: number }, readonly daily: ReadonlyArray<{ readonly date: string, readonly users: number, readonly posts: number, readonly comments: number, readonly reports: number, readonly trackPlays: number }>, readonly usersByStatus: ReadonlyArray<{ readonly key: string, readonly count: number }>, readonly transcriptionsByStatus: ReadonlyArray<{ readonly key: string, readonly count: number }>, readonly playsByProvider: ReadonlyArray<{ readonly key: string, readonly count: number }> } };

export type AdminUsersQueryVariables = Exact<{
  input: AdminUsersInput | null | undefined;
}>;


export type AdminUsersQuery = { readonly adminUsers: { readonly totalCount: number, readonly nodes: ReadonlyArray<{ readonly id: string, readonly email: string, readonly username: string, readonly displayName: string | null, readonly status: UserStatus, readonly role: UserRole, readonly lastLoginAt: unknown, readonly createdAt: unknown, readonly isDeleted: boolean }>, readonly pageInfo: { readonly hasNextPage: boolean, readonly hasPreviousPage: boolean, readonly endCursor: string | null } } };

export type AdminUserQueryVariables = Exact<{
  id: string;
}>;


export type AdminUserQuery = { readonly adminUser: { readonly id: string, readonly email: string, readonly username: string, readonly displayName: string | null, readonly status: UserStatus, readonly role: UserRole, readonly lastLoginAt: unknown, readonly createdAt: unknown, readonly updatedAt: unknown, readonly isDeleted: boolean, readonly deletedAt: unknown, readonly activity: { readonly posts: number, readonly comments: number, readonly playlists: number, readonly uploads: number } | null } | null };

export type AdminSetUserRoleMutationVariables = Exact<{
  input: AdminSetUserRoleInput;
}>;


export type AdminSetUserRoleMutation = { readonly adminSetUserRole: { readonly revokedSessionCount: number, readonly auditLogId: string, readonly user: { readonly id: string, readonly email: string, readonly username: string, readonly displayName: string | null, readonly status: UserStatus, readonly role: UserRole, readonly lastLoginAt: unknown, readonly createdAt: unknown, readonly updatedAt: unknown, readonly isDeleted: boolean, readonly deletedAt: unknown } } };

export type AdminSetUserStatusMutationVariables = Exact<{
  input: AdminSetUserStatusInput;
}>;


export type AdminSetUserStatusMutation = { readonly adminSetUserStatus: { readonly revokedSessionCount: number, readonly auditLogId: string, readonly user: { readonly id: string, readonly email: string, readonly username: string, readonly displayName: string | null, readonly status: UserStatus, readonly role: UserRole, readonly lastLoginAt: unknown, readonly createdAt: unknown, readonly updatedAt: unknown, readonly isDeleted: boolean, readonly deletedAt: unknown } } };

export type AdminDeleteUserMutationVariables = Exact<{
  input: AdminUserActionInput;
}>;


export type AdminDeleteUserMutation = { readonly adminDeleteUser: { readonly revokedSessionCount: number, readonly auditLogId: string, readonly user: { readonly id: string, readonly email: string, readonly username: string, readonly displayName: string | null, readonly status: UserStatus, readonly role: UserRole, readonly lastLoginAt: unknown, readonly createdAt: unknown, readonly updatedAt: unknown, readonly isDeleted: boolean, readonly deletedAt: unknown } } };

export type ReviewInstructorProfileMutationVariables = Exact<{
  id: string;
  status: InstructorStatus;
}>;


export type ReviewInstructorProfileMutation = { readonly reviewInstructorProfile: { readonly id: string, readonly status: InstructorStatus } };

export type AdminRevokeUserSessionsMutationVariables = Exact<{
  input: AdminUserActionInput;
}>;


export type AdminRevokeUserSessionsMutation = { readonly adminRevokeUserSessions: { readonly revokedSessionCount: number, readonly auditLogId: string, readonly user: { readonly id: string, readonly email: string, readonly username: string, readonly displayName: string | null, readonly status: UserStatus, readonly role: UserRole, readonly lastLoginAt: unknown, readonly createdAt: unknown, readonly updatedAt: unknown, readonly isDeleted: boolean, readonly deletedAt: unknown } } };

export type AdminPostsQueryVariables = Exact<{
  input: AdminContentInput | null | undefined;
}>;


export type AdminPostsQuery = { readonly adminPosts: { readonly totalCount: number, readonly nodes: ReadonlyArray<{ readonly id: string, readonly authorId: string, readonly authorUsername: string, readonly content: string | null, readonly visibility: PostVisibility, readonly status: PostStatus, readonly likeCount: number, readonly commentCount: number, readonly createdAt: unknown, readonly isDeleted: boolean }>, readonly pageInfo: { readonly hasNextPage: boolean, readonly hasPreviousPage: boolean, readonly endCursor: string | null } } };

export type AdminPostReportsQueryVariables = Exact<{
  input: AdminContentInput | null | undefined;
}>;


export type AdminPostReportsQuery = { readonly adminPostReports: { readonly totalCount: number, readonly nodes: ReadonlyArray<{ readonly id: string, readonly postId: string, readonly reporterId: string, readonly reporterUsername: string, readonly reason: string, readonly status: ReportStatus, readonly createdAt: unknown, readonly reviewedAt: unknown, readonly isDeleted: boolean, readonly postContent: string | null, readonly postAuthorUsername: string, readonly postStatus: PostStatus, readonly postVisibility: PostVisibility, readonly postIsDeleted: boolean }>, readonly pageInfo: { readonly hasNextPage: boolean, readonly hasPreviousPage: boolean, readonly endCursor: string | null } } };

export type AdminModeratePostReportMutationVariables = Exact<{
  input: AdminModerateReportInput;
}>;


export type AdminModeratePostReportMutation = { readonly adminModeratePostReport: ReportStatus };

export type AdminTranscriptionsQueryVariables = Exact<{
  input: AdminMediaInput | null | undefined;
}>;


export type AdminTranscriptionsQuery = { readonly adminTranscriptions: { readonly totalCount: number, readonly nodes: ReadonlyArray<{ readonly id: string, readonly provider: MusicProvider, readonly trackId: string, readonly title: string | null, readonly artist: string | null, readonly status: TranscriptionStatus, readonly progress: number, readonly attempts: number, readonly createdAt: unknown, readonly isDeleted: boolean }>, readonly pageInfo: { readonly hasNextPage: boolean, readonly hasPreviousPage: boolean, readonly endCursor: string | null } } };

export type AdminUploadsQueryVariables = Exact<{
  input: AdminMediaInput | null | undefined;
}>;


export type AdminUploadsQuery = { readonly adminUploads: { readonly totalCount: number, readonly nodes: ReadonlyArray<{ readonly id: string, readonly userId: string, readonly username: string, readonly fileName: string, readonly fileType: string, readonly fileSize: string, readonly status: UploadStatus, readonly sourceType: UploadSourceType, readonly cleanupPending: boolean, readonly createdAt: unknown, readonly updatedAt: unknown, readonly isDeleted: boolean }>, readonly pageInfo: { readonly hasNextPage: boolean, readonly hasPreviousPage: boolean, readonly endCursor: string | null } } };

export type AdminChordTranscriptionsQueryVariables = Exact<{
  input: AdminMediaInput | null | undefined;
}>;


export type AdminChordTranscriptionsQuery = { readonly adminChordTranscriptions: { readonly totalCount: number, readonly nodes: ReadonlyArray<{ readonly id: string, readonly provider: MusicProvider, readonly providerTrackId: string, readonly title: string | null, readonly artist: string | null, readonly duration: number, readonly cueCount: number, readonly engineVersion: string, readonly createdAt: unknown, readonly updatedAt: unknown }>, readonly pageInfo: { readonly hasNextPage: boolean, readonly hasPreviousPage: boolean, readonly endCursor: string | null } } };

export type AdminPlaylistsQueryVariables = Exact<{
  input: AdminMusicInput | null | undefined;
}>;


export type AdminPlaylistsQuery = { readonly adminPlaylists: { readonly totalCount: number, readonly nodes: ReadonlyArray<{ readonly id: string, readonly userId: string, readonly username: string, readonly name: string, readonly description: string | null, readonly visibility: PlaylistVisibility, readonly itemCount: number, readonly createdAt: unknown, readonly isDeleted: boolean }>, readonly pageInfo: { readonly hasNextPage: boolean, readonly hasPreviousPage: boolean, readonly endCursor: string | null } } };

export type AdminCatalogTracksQueryVariables = Exact<{
  input: AdminMusicInput | null | undefined;
}>;


export type AdminCatalogTracksQuery = { readonly adminCatalogTracks: { readonly totalCount: number, readonly nodes: ReadonlyArray<{ readonly id: string, readonly provider: MusicProvider, readonly providerTrackId: string, readonly title: string, readonly artists: unknown, readonly album: string | null, readonly genre: string | null, readonly durationMs: number, readonly playlistCount: number, readonly createdAt: unknown }>, readonly pageInfo: { readonly hasNextPage: boolean, readonly hasPreviousPage: boolean, readonly endCursor: string | null } } };

export type AdminListeningHistoryQueryVariables = Exact<{
  input: AdminMusicInput | null | undefined;
}>;


export type AdminListeningHistoryQuery = { readonly adminListeningHistory: { readonly totalCount: number, readonly nodes: ReadonlyArray<{ readonly id: string, readonly userId: string, readonly username: string, readonly provider: MusicProvider, readonly providerTrackId: string, readonly title: string, readonly artists: unknown, readonly playCount: number, readonly lastPlayedAt: unknown, readonly createdAt: unknown }>, readonly pageInfo: { readonly hasNextPage: boolean, readonly hasPreviousPage: boolean, readonly endCursor: string | null } } };

export type SetInstructorStorageQuotaMutationVariables = Exact<{
  id: string;
  storageQuotaBytes: string;
}>;


export type SetInstructorStorageQuotaMutation = { readonly setInstructorStorageQuota: { readonly id: string, readonly storageQuotaBytes: string } };

export type AdminAuditLogsQueryVariables = Exact<{
  input: AdminAuditInput | null | undefined;
}>;


export type AdminAuditLogsQuery = { readonly adminAuditLogs: { readonly totalCount: number, readonly nodes: ReadonlyArray<{ readonly id: string, readonly actorId: string, readonly actorUsername: string, readonly action: string, readonly entityType: string, readonly entityId: string | null, readonly metadata: unknown, readonly createdAt: unknown }>, readonly pageInfo: { readonly hasNextPage: boolean, readonly hasPreviousPage: boolean, readonly endCursor: string | null } } };

export type LoginUserMutationVariables = Exact<{
  data: LoginInput;
}>;


export type LoginUserMutation = { readonly login: { readonly accessToken: string, readonly user: { readonly id: string, readonly username: string, readonly email: string, readonly role: UserRole } } };

export type RegisterUserMutationVariables = Exact<{
  data: RegisterInput;
}>;


export type RegisterUserMutation = { readonly register: { readonly email: string, readonly verificationToken: string, readonly expiresAt: unknown, readonly message: string } };

export type VerifyEmailMutationVariables = Exact<{
  data: VerifyEmailInput;
}>;


export type VerifyEmailMutation = { readonly verifyEmail: { readonly accessToken: string, readonly user: { readonly id: string, readonly username: string, readonly email: string, readonly role: UserRole } } };

export type LoginWithGoogleMutationVariables = Exact<{
  data: GoogleAuthInput;
}>;


export type LoginWithGoogleMutation = { readonly loginWithGoogle: { readonly accessToken: string, readonly user: { readonly id: string, readonly username: string, readonly email: string, readonly role: UserRole } } };

export type RegisterWithGoogleMutationVariables = Exact<{
  data: GoogleAuthInput;
}>;


export type RegisterWithGoogleMutation = { readonly registerWithGoogle: { readonly accessToken: string, readonly user: { readonly id: string, readonly username: string, readonly email: string, readonly role: UserRole } } };

export type ResendVerificationEmailMutationVariables = Exact<{
  token: string;
}>;


export type ResendVerificationEmailMutation = { readonly resendVerificationEmail: { readonly email: string, readonly verificationToken: string, readonly expiresAt: unknown, readonly message: string } };

export type RestoreSessionMutationVariables = Exact<{ [key: string]: never; }>;


export type RestoreSessionMutation = { readonly refreshSession: { readonly accessToken: string, readonly user: { readonly id: string, readonly username: string, readonly email: string, readonly role: UserRole } } };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { readonly logout: boolean };

export type RequestPasswordResetMutationVariables = Exact<{
  data: RequestPasswordResetInput;
}>;


export type RequestPasswordResetMutation = { readonly requestPasswordReset: boolean };

export type MySessionsQueryVariables = Exact<{ [key: string]: never; }>;


export type MySessionsQuery = { readonly mySessions: ReadonlyArray<{ readonly id: string, readonly createdAt: unknown, readonly expiresAt: unknown, readonly current: boolean }> };

export type ResetPasswordMutationVariables = Exact<{
  data: ResetPasswordInput;
}>;


export type ResetPasswordMutation = { readonly resetPassword: boolean };

export type MyConversationsQueryVariables = Exact<{ [key: string]: never; }>;


export type MyConversationsQuery = { readonly myConversations: ReadonlyArray<{ readonly id: string, readonly type: ConversationType, readonly name: string | null, readonly updatedAt: unknown, readonly unreadCount: number, readonly participants: ReadonlyArray<{ readonly id: string, readonly userId: string, readonly username: string, readonly avatarUrl: string | null, readonly nickname: string | null, readonly role: ConversationParticipantRole, readonly lastReadAt: unknown }>, readonly lastMessage: { readonly id: string, readonly conversationId: string, readonly senderId: string, readonly senderUsername: string, readonly body: string | null, readonly createdAt: unknown, readonly attachments: ReadonlyArray<{ readonly id: string, readonly uploadId: string, readonly position: number, readonly contentUrl: string }> } | null }> };

export type ConversationMessagesQueryVariables = Exact<{
  conversationId: string;
  before: string | null | undefined;
  take: number;
}>;


export type ConversationMessagesQuery = { readonly conversationMessages: ReadonlyArray<{ readonly id: string, readonly conversationId: string, readonly senderId: string, readonly senderUsername: string, readonly body: string | null, readonly createdAt: unknown, readonly attachments: ReadonlyArray<{ readonly id: string, readonly uploadId: string, readonly position: number, readonly contentUrl: string }> }> };

export type CreateDirectConversationMutationVariables = Exact<{
  friendId: string;
}>;


export type CreateDirectConversationMutation = { readonly createDirectConversation: { readonly id: string, readonly type: ConversationType, readonly name: string | null, readonly updatedAt: unknown, readonly unreadCount: number, readonly participants: ReadonlyArray<{ readonly id: string, readonly userId: string, readonly username: string, readonly avatarUrl: string | null, readonly nickname: string | null, readonly role: ConversationParticipantRole, readonly lastReadAt: unknown }>, readonly lastMessage: { readonly id: string, readonly conversationId: string, readonly senderId: string, readonly senderUsername: string, readonly body: string | null, readonly createdAt: unknown, readonly attachments: ReadonlyArray<{ readonly id: string, readonly uploadId: string, readonly position: number, readonly contentUrl: string }> } | null } };

export type CreateGroupConversationMutationVariables = Exact<{
  name: string;
  memberIds: ReadonlyArray<string> | string;
}>;


export type CreateGroupConversationMutation = { readonly createGroupConversation: { readonly id: string, readonly type: ConversationType, readonly name: string | null, readonly updatedAt: unknown, readonly unreadCount: number, readonly participants: ReadonlyArray<{ readonly id: string, readonly userId: string, readonly username: string, readonly avatarUrl: string | null, readonly nickname: string | null, readonly role: ConversationParticipantRole, readonly lastReadAt: unknown }>, readonly lastMessage: { readonly id: string, readonly conversationId: string, readonly senderId: string, readonly senderUsername: string, readonly body: string | null, readonly createdAt: unknown, readonly attachments: ReadonlyArray<{ readonly id: string, readonly uploadId: string, readonly position: number, readonly contentUrl: string }> } | null } };

export type SendChatMessageMutationVariables = Exact<{
  conversationId: string;
  body: string | null | undefined;
  uploadIds: ReadonlyArray<string> | string;
}>;


export type SendChatMessageMutation = { readonly sendChatMessage: { readonly id: string, readonly conversationId: string, readonly senderId: string, readonly senderUsername: string, readonly body: string | null, readonly createdAt: unknown, readonly attachments: ReadonlyArray<{ readonly id: string, readonly uploadId: string, readonly position: number, readonly contentUrl: string }> } };

export type MarkConversationReadMutationVariables = Exact<{
  conversationId: string;
}>;


export type MarkConversationReadMutation = { readonly markConversationRead: boolean };

export type SetChatNicknameMutationVariables = Exact<{
  conversationId: string;
  nickname: string | null | undefined;
}>;


export type SetChatNicknameMutation = { readonly setChatNickname: boolean };

export type RenameChatGroupMutationVariables = Exact<{
  conversationId: string;
  name: string;
}>;


export type RenameChatGroupMutation = { readonly renameChatGroup: { readonly id: string, readonly type: ConversationType, readonly name: string | null, readonly updatedAt: unknown, readonly unreadCount: number, readonly participants: ReadonlyArray<{ readonly id: string, readonly userId: string, readonly username: string, readonly avatarUrl: string | null, readonly nickname: string | null, readonly role: ConversationParticipantRole, readonly lastReadAt: unknown }>, readonly lastMessage: { readonly id: string, readonly conversationId: string, readonly senderId: string, readonly senderUsername: string, readonly body: string | null, readonly createdAt: unknown, readonly attachments: ReadonlyArray<{ readonly id: string, readonly uploadId: string, readonly position: number, readonly contentUrl: string }> } | null } };

export type AddChatGroupMembersMutationVariables = Exact<{
  conversationId: string;
  memberIds: ReadonlyArray<string> | string;
}>;


export type AddChatGroupMembersMutation = { readonly addChatGroupMembers: { readonly id: string, readonly type: ConversationType, readonly name: string | null, readonly updatedAt: unknown, readonly unreadCount: number, readonly participants: ReadonlyArray<{ readonly id: string, readonly userId: string, readonly username: string, readonly avatarUrl: string | null, readonly nickname: string | null, readonly role: ConversationParticipantRole, readonly lastReadAt: unknown }>, readonly lastMessage: { readonly id: string, readonly conversationId: string, readonly senderId: string, readonly senderUsername: string, readonly body: string | null, readonly createdAt: unknown, readonly attachments: ReadonlyArray<{ readonly id: string, readonly uploadId: string, readonly position: number, readonly contentUrl: string }> } | null } };

export type RevokeSessionMutationVariables = Exact<{
  id: string;
}>;


export type RevokeSessionMutation = { readonly revokeSession: boolean };

export type RemoveChatGroupMemberMutationVariables = Exact<{
  conversationId: string;
  memberId: string;
}>;


export type RemoveChatGroupMemberMutation = { readonly removeChatGroupMember: boolean };

export type SetChatGroupRoleMutationVariables = Exact<{
  conversationId: string;
  memberId: string;
  role: ConversationParticipantRole;
}>;


export type SetChatGroupRoleMutation = { readonly setChatGroupRole: boolean };

export type ChordTranscriptionQueryVariables = Exact<{
  provider: MusicProvider;
  providerTrackId: string;
}>;


export type ChordTranscriptionQuery = { readonly chordTranscription: { readonly provider: MusicProvider, readonly providerTrackId: string, readonly duration: number, readonly engineVersion: string, readonly cues: ReadonlyArray<{ readonly start: number, readonly end: number, readonly chord: string }> } | null };

export type SaveChordTranscriptionMutationVariables = Exact<{
  data: SaveChordTranscriptionInput;
}>;


export type SaveChordTranscriptionMutation = { readonly saveChordTranscription: { readonly provider: MusicProvider, readonly providerTrackId: string, readonly duration: number, readonly engineVersion: string, readonly cues: ReadonlyArray<{ readonly start: number, readonly end: number, readonly chord: string }> } };

export type MyFavoriteMusicQueryVariables = Exact<{ [key: string]: never; }>;


export type MyFavoriteMusicQuery = { readonly myFavoriteMusic: ReadonlyArray<{ readonly provider: string, readonly id: string, readonly providerTrackId: string, readonly audiusId: string, readonly title: string, readonly imageUrl: string | null, readonly audiusUrl: string, readonly externalUrl: string, readonly album: string | null, readonly isrc: string | null, readonly streamUrl: string, readonly genre: string | null, readonly geniusUrl: string | null, readonly geniusMatchScore: number | null, readonly durationMs: number, readonly artists: ReadonlyArray<{ readonly id: string, readonly name: string }> }> };

export type SetTrackFavoriteMutationVariables = Exact<{
  track: RecordTrackListenInput;
  favorite: boolean;
}>;


export type SetTrackFavoriteMutation = { readonly setTrackFavorite: boolean };

export type GetFeedPostsQueryVariables = Exact<{
  after: string | null | undefined;
  take: number;
  query: string | null | undefined;
}>;


export type GetFeedPostsQuery = { readonly posts: ReadonlyArray<{ readonly id: string, readonly content: string | null, readonly likeCount: number, readonly commentCount: number, readonly viewerHasLiked: boolean, readonly viewerLikeId: string | null, readonly createdAt: unknown, readonly author: { readonly id: string, readonly username: string, readonly avatarUrl: string | null, readonly profile: { readonly avatarUrl: string | null } | null }, readonly mentionedUsers: ReadonlyArray<{ readonly id: string, readonly username: string, readonly avatarUrl: string | null, readonly profile: { readonly avatarUrl: string | null } | null }>, readonly attachments: ReadonlyArray<{ readonly id: string, readonly upload: { readonly id: string, readonly storagePath: string } }> }> };

export type FeedPostQueryVariables = Exact<{
  id: string;
}>;


export type FeedPostQuery = { readonly post: { readonly id: string, readonly content: string | null, readonly likeCount: number, readonly commentCount: number, readonly viewerHasLiked: boolean, readonly viewerLikeId: string | null, readonly createdAt: unknown, readonly author: { readonly id: string, readonly username: string, readonly avatarUrl: string | null, readonly profile: { readonly avatarUrl: string | null } | null }, readonly mentionedUsers: ReadonlyArray<{ readonly id: string, readonly username: string, readonly avatarUrl: string | null, readonly profile: { readonly avatarUrl: string | null } | null }>, readonly attachments: ReadonlyArray<{ readonly id: string, readonly upload: { readonly id: string, readonly storagePath: string } }> } | null };

export type CreateFeedPostMutationVariables = Exact<{
  data: CreatePostInput;
}>;


export type CreateFeedPostMutation = { readonly createPost: { readonly id: string, readonly content: string | null, readonly likeCount: number, readonly commentCount: number, readonly createdAt: unknown, readonly author: { readonly id: string, readonly username: string, readonly avatarUrl: string | null, readonly profile: { readonly avatarUrl: string | null } | null }, readonly comments: ReadonlyArray<{ readonly id: string, readonly content: string, readonly createdAt: unknown, readonly author: { readonly id: string, readonly username: string, readonly avatarUrl: string | null, readonly profile: { readonly avatarUrl: string | null } | null } }> } };

export type CreateCommentMutationVariables = Exact<{
  data: CreateCommentInput;
}>;


export type CreateCommentMutation = { readonly createComment: { readonly id: string, readonly content: string, readonly createdAt: unknown, readonly author: { readonly id: string, readonly username: string, readonly avatarUrl: string | null, readonly profile: { readonly avatarUrl: string | null } | null }, readonly mentionedUsers: ReadonlyArray<{ readonly id: string, readonly username: string, readonly avatarUrl: string | null, readonly profile: { readonly avatarUrl: string | null } | null }> } };

export type ChangePasswordMutationVariables = Exact<{
  data: ChangePasswordInput;
}>;


export type ChangePasswordMutation = { readonly changePassword: boolean };

export type PostCommentsQueryVariables = Exact<{
  postId: string;
  skip: number;
  take: number;
}>;


export type PostCommentsQuery = { readonly commentsByPost: ReadonlyArray<{ readonly id: string, readonly content: string, readonly createdAt: unknown, readonly author: { readonly id: string, readonly username: string, readonly avatarUrl: string | null, readonly profile: { readonly avatarUrl: string | null } | null }, readonly mentionedUsers: ReadonlyArray<{ readonly id: string, readonly username: string, readonly avatarUrl: string | null, readonly profile: { readonly avatarUrl: string | null } | null }> }> };

export type LikePostMutationVariables = Exact<{
  postId: string;
}>;


export type LikePostMutation = { readonly likePost: { readonly id: string } };

export type UnlikePostMutationVariables = Exact<{
  postId: string;
}>;


export type UnlikePostMutation = { readonly unlikePost: { readonly id: string } };

export type UpdateFeedPostMutationVariables = Exact<{
  id: string;
  data: UpdatePostInput;
}>;


export type UpdateFeedPostMutation = { readonly updatePost: { readonly id: string } };

export type DeleteFeedPostMutationVariables = Exact<{
  id: string;
}>;


export type DeleteFeedPostMutation = { readonly deletePost: { readonly id: string } };

export type UpdateFeedCommentMutationVariables = Exact<{
  id: string;
  data: UpdateCommentInput;
}>;


export type UpdateFeedCommentMutation = { readonly updateComment: { readonly id: string, readonly content: string, readonly createdAt: unknown, readonly author: { readonly id: string, readonly username: string, readonly avatarUrl: string | null, readonly profile: { readonly avatarUrl: string | null } | null }, readonly mentionedUsers: ReadonlyArray<{ readonly id: string, readonly username: string, readonly avatarUrl: string | null, readonly profile: { readonly avatarUrl: string | null } | null }> } };

export type DeleteFeedCommentMutationVariables = Exact<{
  id: string;
}>;


export type DeleteFeedCommentMutation = { readonly deleteComment: { readonly id: string } };

export type ReportFeedPostMutationVariables = Exact<{
  postId: string;
  reason: string;
}>;


export type ReportFeedPostMutation = { readonly reportPost: { readonly id: string } };

export type FindUsersQueryVariables = Exact<{
  query: string;
}>;


export type FindUsersQuery = { readonly searchUsers: ReadonlyArray<{ readonly id: string, readonly username: string, readonly avatarUrl: string | null, readonly profile: { readonly id: string, readonly displayName: string, readonly avatarUrl: string | null, readonly bio: string | null } | null }> };

export type FriendsQueryVariables = Exact<{ [key: string]: never; }>;


export type FriendsQuery = { readonly myFriendships: ReadonlyArray<{ readonly id: string, readonly requesterId: string, readonly receiverId: string, readonly status: FriendshipStatus, readonly requester: { readonly id: string, readonly username: string, readonly avatarUrl: string | null, readonly profile: { readonly id: string, readonly displayName: string, readonly avatarUrl: string | null, readonly bio: string | null } | null }, readonly receiver: { readonly id: string, readonly username: string, readonly avatarUrl: string | null, readonly profile: { readonly id: string, readonly displayName: string, readonly avatarUrl: string | null, readonly bio: string | null } | null } }> };

export type DeleteMyAccountMutationVariables = Exact<{
  data: DeleteAccountInput;
}>;


export type DeleteMyAccountMutation = { readonly deleteMyAccount: boolean };

export type AddFriendMutationVariables = Exact<{
  receiverId: string;
}>;


export type AddFriendMutation = { readonly sendFriendRequest: { readonly id: string } };

export type RespondFriendMutationVariables = Exact<{
  id: string;
  accept: boolean;
}>;


export type RespondFriendMutation = { readonly respondFriendRequest: { readonly id: string } };

export type RemoveFriendMutationVariables = Exact<{
  id: string;
}>;


export type RemoveFriendMutation = { readonly removeFriend: { readonly id: string } };

export type RefreshSessionMutationVariables = Exact<{ [key: string]: never; }>;


export type RefreshSessionMutation = { readonly refreshSession: { readonly accessToken: string } };

export type MyListeningHistoryQueryVariables = Exact<{
  take: number;
  skip: number;
}>;


export type MyListeningHistoryQuery = { readonly myListeningHistory: ReadonlyArray<{ readonly provider: string, readonly id: string, readonly providerTrackId: string, readonly audiusId: string, readonly title: string, readonly imageUrl: string | null, readonly audiusUrl: string, readonly externalUrl: string, readonly album: string | null, readonly isrc: string | null, readonly streamUrl: string, readonly genre: string | null, readonly geniusUrl: string | null, readonly geniusMatchScore: number | null, readonly durationMs: number, readonly artists: ReadonlyArray<{ readonly id: string, readonly name: string }> }> };

export type MyListeningStatsQueryVariables = Exact<{ [key: string]: never; }>;


export type MyListeningStatsQuery = { readonly myListeningStats: { readonly totalPlays: number, readonly repeatedTracks: number, readonly repeatPlays: number, readonly daily: ReadonlyArray<{ readonly date: string, readonly listens: number }> } };

export type RecordTrackListenMutationVariables = Exact<{
  track: RecordTrackListenInput;
}>;


export type RecordTrackListenMutation = { readonly recordTrackListen: boolean };

export type ModerationReportsQueryVariables = Exact<{ [key: string]: never; }>;


export type ModerationReportsQuery = { readonly postReports: ReadonlyArray<{ readonly id: string, readonly reason: string, readonly status: ReportStatus, readonly createdAt: unknown, readonly reviewedAt: unknown, readonly reporter: { readonly id: string, readonly username: string }, readonly post: { readonly id: string, readonly content: string | null, readonly author: { readonly id: string, readonly username: string } } }> };

export type ModerateReportMutationVariables = Exact<{
  id: string;
  data: UpdatePostReportInput;
}>;


export type ModerateReportMutation = { readonly updatePostReport: { readonly id: string, readonly status: ReportStatus, readonly reviewedAt: unknown } };

export type SearchMusicQueryVariables = Exact<{
  query: string;
  limit: number;
  cursor: string | null | undefined;
}>;


export type SearchMusicQuery = { readonly searchMusic: { readonly provider: string, readonly total: number, readonly nextCursor: string | null, readonly tracks: ReadonlyArray<{ readonly provider: string, readonly id: string, readonly providerTrackId: string, readonly audiusId: string, readonly title: string, readonly imageUrl: string | null, readonly audiusUrl: string, readonly externalUrl: string, readonly album: string | null, readonly isrc: string | null, readonly streamUrl: string, readonly genre: string | null, readonly geniusUrl: string | null, readonly geniusMatchScore: number | null, readonly durationMs: number, readonly artists: ReadonlyArray<{ readonly id: string, readonly name: string }> }> } };

export type AdminBackendStatusQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminBackendStatusQuery = { readonly adminBackendStatus: { readonly databaseReachable: boolean, readonly serverTime: unknown } };

export type TrendingMusicQueryVariables = Exact<{ [key: string]: never; }>;


export type TrendingMusicQuery = { readonly trendingMusic: ReadonlyArray<{ readonly provider: string, readonly id: string, readonly providerTrackId: string, readonly audiusId: string, readonly title: string, readonly imageUrl: string | null, readonly audiusUrl: string, readonly externalUrl: string, readonly album: string | null, readonly isrc: string | null, readonly streamUrl: string, readonly genre: string | null, readonly geniusUrl: string | null, readonly geniusMatchScore: number | null, readonly durationMs: number, readonly artists: ReadonlyArray<{ readonly id: string, readonly name: string }> }> };

export type MyMusicRecommendationsQueryVariables = Exact<{ [key: string]: never; }>;


export type MyMusicRecommendationsQuery = { readonly myMusicRecommendations: ReadonlyArray<{ readonly provider: string, readonly id: string, readonly providerTrackId: string, readonly audiusId: string, readonly title: string, readonly imageUrl: string | null, readonly audiusUrl: string, readonly externalUrl: string, readonly album: string | null, readonly isrc: string | null, readonly streamUrl: string, readonly genre: string | null, readonly geniusUrl: string | null, readonly geniusMatchScore: number | null, readonly durationMs: number, readonly artists: ReadonlyArray<{ readonly id: string, readonly name: string }> }> };

export type NotificationsQueryVariables = Exact<{
  after: string | null | undefined;
}>;


export type NotificationsQuery = { readonly myNotifications: ReadonlyArray<{ readonly id: string, readonly type: NotificationType, readonly payload: unknown, readonly actorAvatarUrl: string | null, readonly readAt: unknown, readonly createdAt: unknown, readonly actor: { readonly id: string, readonly username: string } | null }> };

export type UnreadNotificationCountQueryVariables = Exact<{ [key: string]: never; }>;


export type UnreadNotificationCountQuery = { readonly unreadNotificationCount: number };

export type NotificationPreferencesQueryVariables = Exact<{ [key: string]: never; }>;


export type NotificationPreferencesQuery = { readonly myNotificationPreferences: ReadonlyArray<{ readonly id: string, readonly type: NotificationType, readonly enabled: boolean }> };

export type ReadNotificationMutationVariables = Exact<{
  id: string;
}>;


export type ReadNotificationMutation = { readonly markNotificationRead: { readonly id: string, readonly readAt: unknown } };

export type NotificationPreferenceMutationVariables = Exact<{
  type: NotificationType;
  enabled: boolean;
}>;


export type NotificationPreferenceMutation = { readonly setNotificationPreference: { readonly id: string, readonly type: NotificationType, readonly enabled: boolean } };

export type MyPlaylistsQueryVariables = Exact<{ [key: string]: never; }>;


export type MyPlaylistsQuery = { readonly myPlaylists: ReadonlyArray<{ readonly id: string, readonly userId: string, readonly name: string, readonly description: string | null, readonly coverUrl: string | null, readonly visibility: PlaylistVisibility, readonly version: number, readonly createdAt: unknown, readonly updatedAt: unknown }> };

export type PlaylistItemsQueryVariables = Exact<{
  id: string;
  take: number;
  after: string | null | undefined;
}>;


export type PlaylistItemsQuery = { readonly playlistItems: ReadonlyArray<{ readonly id: string, readonly playlistId: string, readonly trackId: string, readonly addedById: string, readonly position: number, readonly track: { readonly id: string, readonly provider: MusicProvider, readonly providerTrackId: string, readonly title: string, readonly album: string | null, readonly genre: string | null, readonly imageUrl: string | null, readonly externalUrl: string, readonly durationMs: number, readonly isrc: string | null, readonly artists: ReadonlyArray<{ readonly id: string, readonly name: string }> } }> };

export type PublicPlaylistQueryVariables = Exact<{
  id: string;
}>;


export type PublicPlaylistQuery = { readonly publicPlaylist: { readonly id: string, readonly name: string, readonly description: string | null, readonly coverUrl: string | null } | null };

export type AdminManagedEntitiesQueryVariables = Exact<{
  input: AdminManagedEntityListInput;
}>;


export type AdminManagedEntitiesQuery = { readonly adminManagedEntities: { readonly nodes: ReadonlyArray<unknown>, readonly totalCount: number } };

export type PublicPlaylistItemsQueryVariables = Exact<{
  id: string;
  take: number;
  after: string | null | undefined;
}>;


export type PublicPlaylistItemsQuery = { readonly publicPlaylistItems: ReadonlyArray<{ readonly id: string, readonly position: number, readonly track: { readonly id: string, readonly provider: MusicProvider, readonly providerTrackId: string, readonly title: string, readonly album: string | null, readonly genre: string | null, readonly imageUrl: string | null, readonly externalUrl: string, readonly durationMs: number, readonly isrc: string | null, readonly artists: ReadonlyArray<{ readonly id: string, readonly name: string }> } }> };

export type CreatePlaylistMutationVariables = Exact<{
  data: CreatePlaylistInput;
}>;


export type CreatePlaylistMutation = { readonly createPlaylist: { readonly id: string, readonly userId: string, readonly name: string, readonly description: string | null, readonly coverUrl: string | null, readonly visibility: PlaylistVisibility, readonly version: number, readonly createdAt: unknown, readonly updatedAt: unknown } };

export type UpdatePlaylistMutationVariables = Exact<{
  id: string;
  data: UpdatePlaylistInput;
}>;


export type UpdatePlaylistMutation = { readonly updatePlaylist: { readonly id: string, readonly userId: string, readonly name: string, readonly description: string | null, readonly coverUrl: string | null, readonly visibility: PlaylistVisibility, readonly version: number, readonly createdAt: unknown, readonly updatedAt: unknown } };

export type DeletePlaylistMutationVariables = Exact<{
  id: string;
}>;


export type DeletePlaylistMutation = { readonly deletePlaylist: boolean };

export type AddTrackMutationVariables = Exact<{
  data: AddTrackToPlaylistInput;
}>;


export type AddTrackMutation = { readonly addTrackToPlaylist: { readonly id: string, readonly playlistId: string, readonly trackId: string, readonly addedById: string, readonly position: number, readonly track: { readonly id: string, readonly provider: MusicProvider, readonly providerTrackId: string, readonly title: string, readonly album: string | null, readonly genre: string | null, readonly imageUrl: string | null, readonly externalUrl: string, readonly durationMs: number, readonly isrc: string | null, readonly artists: ReadonlyArray<{ readonly id: string, readonly name: string }> } } };

export type RemoveTrackMutationVariables = Exact<{
  playlistId: string;
  itemId: string;
}>;


export type RemoveTrackMutation = { readonly removeTrackFromPlaylist: boolean };

export type ReorderMutationVariables = Exact<{
  data: ReorderPlaylistItemsInput;
}>;


export type ReorderMutation = { readonly reorderPlaylistItems: { readonly id: string, readonly userId: string, readonly name: string, readonly description: string | null, readonly coverUrl: string | null, readonly visibility: PlaylistVisibility, readonly version: number, readonly createdAt: unknown, readonly updatedAt: unknown } };

export type UserProfileQueryVariables = Exact<{
  userId: string;
}>;


export type UserProfileQuery = { readonly profileByUserId: { readonly id: string, readonly userId: string, readonly displayName: string, readonly avatarUrl: string | null, readonly bio: string | null, readonly visibility: ProfileVisibility, readonly user: { readonly id: string, readonly username: string, readonly avatarUrl: string | null, readonly authoredPosts: ReadonlyArray<{ readonly id: string, readonly content: string | null, readonly likeCount: number, readonly commentCount: number, readonly viewerHasLiked: boolean, readonly viewerLikeId: string | null, readonly createdAt: unknown, readonly author: { readonly id: string, readonly username: string, readonly avatarUrl: string | null, readonly profile: { readonly avatarUrl: string | null } | null }, readonly mentionedUsers: ReadonlyArray<{ readonly id: string, readonly username: string, readonly avatarUrl: string | null, readonly profile: { readonly avatarUrl: string | null } | null }>, readonly attachments: ReadonlyArray<{ readonly id: string, readonly upload: { readonly id: string, readonly storagePath: string } }> }> } } | null, readonly user: { readonly id: string, readonly username: string, readonly avatarUrl: string | null, readonly authoredPosts: ReadonlyArray<{ readonly id: string, readonly content: string | null, readonly likeCount: number, readonly commentCount: number, readonly viewerHasLiked: boolean, readonly viewerLikeId: string | null, readonly createdAt: unknown, readonly author: { readonly id: string, readonly username: string, readonly avatarUrl: string | null, readonly profile: { readonly avatarUrl: string | null } | null }, readonly mentionedUsers: ReadonlyArray<{ readonly id: string, readonly username: string, readonly avatarUrl: string | null, readonly profile: { readonly avatarUrl: string | null } | null }>, readonly attachments: ReadonlyArray<{ readonly id: string, readonly upload: { readonly id: string, readonly storagePath: string } }> }> } | null };

export type UpdateProfileMutationVariables = Exact<{
  id: string;
  data: UpdateProfileInput;
}>;


export type UpdateProfileMutation = { readonly updateProfile: { readonly id: string } };

export type CreateProfileMutationVariables = Exact<{
  data: CreateProfileInput;
}>;


export type CreateProfileMutation = { readonly createProfile: { readonly id: string } };
