/* eslint-disable */
import * as types from "./graphql";
import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
  "mutation ForgotPassword($auth: ForgotPasswordInput!) {\n  forgotPassword(auth: $auth)\n}": typeof types.ForgotPasswordDocument;
  "query Login($auth: AuthInput!) {\n  login(auth: $auth) {\n    user {\n      id\n      created_at\n      email\n      is_verified\n      profile {\n        id\n        first_name\n        last_name\n        full_name\n        avatar\n        skills {\n          name\n          mastery\n        }\n        languages {\n          name\n          proficiency\n        }\n      }\n      cvs {\n        id\n        name\n        education\n        description\n      }\n      department {\n        id\n      }\n      department_name\n      position {\n        id\n      }\n      position_name\n      role\n    }\n    access_token\n    refresh_token\n  }\n}": typeof types.LoginDocument;
  "mutation ResetPassword($auth: ResetPasswordInput!) {\n  resetPassword(auth: $auth)\n}": typeof types.ResetPasswordDocument;
  "mutation Signup($auth: AuthInput!) {\n  signup(auth: $auth) {\n    user {\n      id\n      created_at\n      email\n      is_verified\n      profile {\n        id\n        first_name\n        last_name\n        full_name\n        avatar\n      }\n      cvs {\n        id\n      }\n      department {\n        id\n      }\n      department_name\n      position {\n        id\n      }\n      position_name\n      role\n    }\n    access_token\n    refresh_token\n  }\n}": typeof types.SignupDocument;
  "mutation UpdateToken {\n  updateToken {\n    access_token\n    refresh_token\n  }\n}": typeof types.UpdateTokenDocument;
  "mutation DeleteAvatar($avatar: DeleteAvatarInput!) {\n  deleteAvatar(avatar: $avatar)\n}": typeof types.DeleteAvatarDocument;
  "mutation UploadAvatar($avatar: UploadAvatarInput!) {\n  uploadAvatar(avatar: $avatar)\n}": typeof types.UploadAvatarDocument;
  "mutation AddCvProject($project: AddCvProjectInput!) {\n  addCvProject(project: $project) {\n    id\n    created_at\n    name\n    education\n    description\n    user {\n      id\n      email\n    }\n    projects {\n      id\n      name\n      internal_name\n      description\n      domain\n      start_date\n      end_date\n      environment\n      roles\n      responsibilities\n      project {\n        id\n        name\n        internal_name\n      }\n    }\n    skills {\n      name\n      mastery\n      categoryId\n    }\n    languages {\n      __typename\n    }\n  }\n}": typeof types.AddCvProjectDocument;
  "mutation AddCvSkill($skill: AddCvSkillInput!) {\n  addCvSkill(skill: $skill) {\n    id\n    created_at\n    name\n    description\n  }\n}": typeof types.AddCvSkillDocument;
  "mutation CreateCv($cv: CreateCvInput!) {\n  createCv(cv: $cv) {\n    id\n    created_at\n    name\n    education\n    description\n  }\n}": typeof types.CreateCvDocument;
  "mutation DeleteCvSkill($skill: DeleteCvSkillInput!) {\n  deleteCvSkill(skill: $skill) {\n    id\n    created_at\n    name\n    description\n  }\n}": typeof types.DeleteCvSkillDocument;
  "mutation DeleteCv($cv: DeleteCvInput!) {\n  deleteCv(cv: $cv) {\n    affected\n  }\n}": typeof types.DeleteCvDocument;
  "query Cv($cvId: ID!) {\n  cv(cvId: $cvId) {\n    id\n    created_at\n    name\n    education\n    description\n    user {\n      id\n      email\n    }\n    projects {\n      id\n      name\n      internal_name\n      description\n      domain\n      start_date\n      end_date\n      environment\n      roles\n      responsibilities\n      project {\n        id\n        name\n        internal_name\n      }\n    }\n    skills {\n      name\n      mastery\n      categoryId\n    }\n    languages {\n      __typename\n    }\n  }\n}": typeof types.CvDocument;
  "query Cvs {\n  cvs {\n    id\n    created_at\n    name\n    education\n    description\n    user {\n      id\n      email\n    }\n    projects {\n      __typename\n    }\n    skills {\n      __typename\n    }\n    languages {\n      __typename\n    }\n  }\n}": typeof types.CvsDocument;
  "mutation RemoveCvProject($project: RemoveCvProjectInput!) {\n  removeCvProject(project: $project) {\n    id\n    created_at\n    name\n    education\n    description\n    user {\n      id\n      email\n    }\n    projects {\n      id\n      name\n      internal_name\n      description\n      domain\n      start_date\n      end_date\n      environment\n      roles\n      responsibilities\n      project {\n        id\n        name\n        internal_name\n      }\n    }\n    skills {\n      name\n      mastery\n      categoryId\n    }\n    languages {\n      __typename\n    }\n  }\n}": typeof types.RemoveCvProjectDocument;
  "mutation UpdateCvProject($project: UpdateCvProjectInput!) {\n  updateCvProject(project: $project) {\n    id\n    created_at\n    name\n    education\n    description\n    user {\n      id\n      email\n    }\n    projects {\n      id\n      name\n      internal_name\n      description\n      domain\n      start_date\n      end_date\n      environment\n      roles\n      responsibilities\n      project {\n        id\n        name\n        internal_name\n      }\n    }\n    skills {\n      name\n      mastery\n      categoryId\n    }\n    languages {\n      __typename\n    }\n  }\n}": typeof types.UpdateCvProjectDocument;
  "mutation UpdateCvSkill($skill: UpdateCvSkillInput!) {\n  updateCvSkill(skill: $skill) {\n    id\n    created_at\n    name\n    description\n  }\n}": typeof types.UpdateCvSkillDocument;
  "mutation UpdateCv($cv: UpdateCvInput!) {\n  updateCv(cv: $cv) {\n    id\n    created_at\n    name\n    education\n    description\n  }\n}": typeof types.UpdateCvDocument;
  "mutation CreateDepartment($department: CreateDepartmentInput!) {\n  createDepartment(department: $department) {\n    id\n    created_at\n    name\n  }\n}": typeof types.CreateDepartmentDocument;
  "mutation DeleteDepartment($department: DeleteDepartmentInput!) {\n  deleteDepartment(department: $department) {\n    affected\n  }\n}": typeof types.DeleteDepartmentDocument;
  "query Departments {\n  departments {\n    id\n    created_at\n    name\n  }\n}": typeof types.DepartmentsDocument;
  "mutation UpdateDepartment($department: UpdateDepartmentInput!) {\n  updateDepartment(department: $department) {\n    id\n    created_at\n    name\n  }\n}": typeof types.UpdateDepartmentDocument;
  "mutation ExportPdf($pdf: ExportPdfInput!) {\n  exportPdf(pdf: $pdf)\n}": typeof types.ExportPdfDocument;
  "mutation CreateLanguage($language: CreateLanguageInput!) {\n  createLanguage(language: $language) {\n    id\n    created_at\n    iso2\n    name\n    native_name\n  }\n}": typeof types.CreateLanguageDocument;
  "mutation DeleteLanguage($language: DeleteLanguageInput!) {\n  deleteLanguage(language: $language) {\n    affected\n  }\n}": typeof types.DeleteLanguageDocument;
  "query Languages {\n  languages {\n    id\n    created_at\n    iso2\n    name\n    native_name\n  }\n}": typeof types.LanguagesDocument;
  "mutation UpdateLanguage($language: UpdateLanguageInput!) {\n  updateLanguage(language: $language) {\n    id\n    created_at\n    iso2\n    name\n    native_name\n  }\n}": typeof types.UpdateLanguageDocument;
  "mutation VerifyMail($mail: VerifyMailInput!) {\n  verifyMail(mail: $mail)\n}": typeof types.VerifyMailDocument;
  "mutation CreatePosition($position: CreatePositionInput!) {\n  createPosition(position: $position) {\n    id\n    created_at\n    name\n  }\n}": typeof types.CreatePositionDocument;
  "mutation DeletePosition($position: DeletePositionInput!) {\n  deletePosition(position: $position) {\n    affected\n  }\n}": typeof types.DeletePositionDocument;
  "query Positions {\n  positions {\n    id\n    created_at\n    name\n  }\n}": typeof types.PositionsDocument;
  "mutation UpdatePosition($position: UpdatePositionInput!) {\n  updatePosition(position: $position) {\n    id\n    created_at\n    name\n  }\n}": typeof types.UpdatePositionDocument;
  "mutation AddProfileLanguage($language: AddProfileLanguageInput!) {\n  addProfileLanguage(language: $language) {\n    id\n    created_at\n    languages {\n      name\n      proficiency\n    }\n  }\n}": typeof types.AddProfileLanguageDocument;
  "mutation AddProfileSkill($skill: AddProfileSkillInput!) {\n  addProfileSkill(skill: $skill) {\n    id\n    created_at\n    skills {\n      name\n      mastery\n      categoryId\n    }\n  }\n}": typeof types.AddProfileSkillDocument;
  "mutation DeleteProfileLanguage($language: DeleteProfileLanguageInput!) {\n  deleteProfileLanguage(language: $language) {\n    id\n    created_at\n    languages {\n      name\n      proficiency\n    }\n  }\n}": typeof types.DeleteProfileLanguageDocument;
  "mutation DeleteProfileSkill($skill: DeleteProfileSkillInput!) {\n  deleteProfileSkill(skill: $skill) {\n    id\n    created_at\n    skills {\n      name\n      mastery\n      categoryId\n    }\n  }\n}": typeof types.DeleteProfileSkillDocument;
  "query Profile($userId: ID!) {\n  profile(userId: $userId) {\n    id\n    created_at\n    first_name\n    last_name\n    full_name\n    avatar\n    skills {\n      name\n      mastery\n      categoryId\n    }\n    languages {\n      name\n      proficiency\n    }\n  }\n}": typeof types.ProfileDocument;
  "mutation UpdateProfileLanguage($language: UpdateProfileLanguageInput!) {\n  updateProfileLanguage(language: $language) {\n    id\n    created_at\n    languages {\n      name\n      proficiency\n    }\n  }\n}": typeof types.UpdateProfileLanguageDocument;
  "mutation UpdateProfileSkill($skill: UpdateProfileSkillInput!) {\n  updateProfileSkill(skill: $skill) {\n    id\n    created_at\n    skills {\n      name\n      mastery\n      categoryId\n    }\n  }\n}": typeof types.UpdateProfileSkillDocument;
  "mutation UpdateProfile($profile: UpdateProfileInput!) {\n  updateProfile(profile: $profile) {\n    id\n    created_at\n    first_name\n    last_name\n    full_name\n    avatar\n  }\n}": typeof types.UpdateProfileDocument;
  "mutation CreateProject($project: CreateProjectInput!) {\n  createProject(project: $project) {\n    id\n    created_at\n    name\n    internal_name\n    domain\n    start_date\n    end_date\n    description\n    environment\n  }\n}": typeof types.CreateProjectDocument;
  "mutation DeleteProject($project: DeleteProjectInput!) {\n  deleteProject(project: $project) {\n    affected\n  }\n}": typeof types.DeleteProjectDocument;
  "query Project($projectId: ID!) {\n  project(projectId: $projectId) {\n    id\n    created_at\n    name\n    internal_name\n    domain\n    start_date\n    end_date\n    description\n    environment\n  }\n}": typeof types.ProjectDocument;
  "query Projects {\n  projects {\n    id\n    created_at\n    name\n    internal_name\n    domain\n    start_date\n    end_date\n    description\n    environment\n  }\n}": typeof types.ProjectsDocument;
  "mutation UpdateProject($project: UpdateProjectInput!) {\n  updateProject(project: $project) {\n    id\n    created_at\n    name\n    internal_name\n    domain\n    start_date\n    end_date\n    description\n    environment\n  }\n}": typeof types.UpdateProjectDocument;
  "mutation CreateSkill($skill: CreateSkillInput!) {\n  createSkill(skill: $skill) {\n    id\n    created_at\n    name\n    category_name\n    category_parent_name\n  }\n}": typeof types.CreateSkillDocument;
  "mutation DeleteSkill($skill: DeleteSkillInput!) {\n  deleteSkill(skill: $skill) {\n    affected\n  }\n}": typeof types.DeleteSkillDocument;
  "query SkillCategories {\n  skillCategories {\n    id\n    name\n    order\n    parent {\n      id\n      name\n      order\n    }\n    children {\n      id\n      name\n      order\n    }\n  }\n}": typeof types.SkillCategoriesDocument;
  "query Skills {\n  skills {\n    id\n    created_at\n    name\n    category_name\n    category_parent_name\n    category {\n      id\n      name\n      order\n      parent {\n        id\n        name\n        order\n      }\n    }\n  }\n}": typeof types.SkillsDocument;
  "mutation UpdateSkill($skill: UpdateSkillInput!) {\n  updateSkill(skill: $skill) {\n    id\n    created_at\n    name\n    category_name\n    category_parent_name\n  }\n}": typeof types.UpdateSkillDocument;
  "mutation CreateUser($user: CreateUserInput!) {\n  createUser(user: $user) {\n    id\n    created_at\n    email\n    is_verified\n    role\n  }\n}": typeof types.CreateUserDocument;
  "mutation DeleteUser($userId: ID!) {\n  deleteUser(userId: $userId) {\n    affected\n  }\n}": typeof types.DeleteUserDocument;
  "query User($userId: ID!) {\n  user(userId: $userId) {\n    id\n    created_at\n    email\n    is_verified\n    role\n    department_name\n    position_name\n    profile {\n      id\n      created_at\n      first_name\n      last_name\n      full_name\n      avatar\n      skills {\n        name\n        mastery\n        categoryId\n      }\n      languages {\n        name\n        proficiency\n      }\n    }\n    department {\n      id\n      created_at\n      name\n    }\n    position {\n      id\n      created_at\n      name\n    }\n    cvs {\n      id\n      created_at\n      name\n      education\n      description\n      user {\n        id\n        email\n        profile {\n          id\n          full_name\n          avatar\n        }\n      }\n    }\n  }\n}": typeof types.UserDocument;
  "query Users {\n  users {\n    id\n    created_at\n    email\n    is_verified\n    role\n    department_name\n    position_name\n    profile {\n      id\n      created_at\n      first_name\n      last_name\n      full_name\n      avatar\n    }\n    department {\n      id\n      created_at\n      name\n    }\n    position {\n      id\n      created_at\n      name\n    }\n    cvs {\n      id\n      created_at\n      name\n      description\n    }\n  }\n}": typeof types.UsersDocument;
  "mutation UpdateUser($user: UpdateUserInput!) {\n  updateUser(user: $user) {\n    id\n    created_at\n    email\n    is_verified\n    role\n  }\n}": typeof types.UpdateUserDocument;
};
const documents: Documents = {
  "mutation ForgotPassword($auth: ForgotPasswordInput!) {\n  forgotPassword(auth: $auth)\n}":
    types.ForgotPasswordDocument,
  "query Login($auth: AuthInput!) {\n  login(auth: $auth) {\n    user {\n      id\n      created_at\n      email\n      is_verified\n      profile {\n        id\n        first_name\n        last_name\n        full_name\n        avatar\n        skills {\n          name\n          mastery\n        }\n        languages {\n          name\n          proficiency\n        }\n      }\n      cvs {\n        id\n        name\n        education\n        description\n      }\n      department {\n        id\n      }\n      department_name\n      position {\n        id\n      }\n      position_name\n      role\n    }\n    access_token\n    refresh_token\n  }\n}":
    types.LoginDocument,
  "mutation ResetPassword($auth: ResetPasswordInput!) {\n  resetPassword(auth: $auth)\n}":
    types.ResetPasswordDocument,
  "mutation Signup($auth: AuthInput!) {\n  signup(auth: $auth) {\n    user {\n      id\n      created_at\n      email\n      is_verified\n      profile {\n        id\n        first_name\n        last_name\n        full_name\n        avatar\n      }\n      cvs {\n        id\n      }\n      department {\n        id\n      }\n      department_name\n      position {\n        id\n      }\n      position_name\n      role\n    }\n    access_token\n    refresh_token\n  }\n}":
    types.SignupDocument,
  "mutation UpdateToken {\n  updateToken {\n    access_token\n    refresh_token\n  }\n}":
    types.UpdateTokenDocument,
  "mutation DeleteAvatar($avatar: DeleteAvatarInput!) {\n  deleteAvatar(avatar: $avatar)\n}":
    types.DeleteAvatarDocument,
  "mutation UploadAvatar($avatar: UploadAvatarInput!) {\n  uploadAvatar(avatar: $avatar)\n}":
    types.UploadAvatarDocument,
  "mutation AddCvProject($project: AddCvProjectInput!) {\n  addCvProject(project: $project) {\n    id\n    created_at\n    name\n    education\n    description\n    user {\n      id\n      email\n    }\n    projects {\n      id\n      name\n      internal_name\n      description\n      domain\n      start_date\n      end_date\n      environment\n      roles\n      responsibilities\n      project {\n        id\n        name\n        internal_name\n      }\n    }\n    skills {\n      name\n      mastery\n      categoryId\n    }\n    languages {\n      __typename\n    }\n  }\n}":
    types.AddCvProjectDocument,
  "mutation AddCvSkill($skill: AddCvSkillInput!) {\n  addCvSkill(skill: $skill) {\n    id\n    created_at\n    name\n    description\n  }\n}":
    types.AddCvSkillDocument,
  "mutation CreateCv($cv: CreateCvInput!) {\n  createCv(cv: $cv) {\n    id\n    created_at\n    name\n    education\n    description\n  }\n}":
    types.CreateCvDocument,
  "mutation DeleteCvSkill($skill: DeleteCvSkillInput!) {\n  deleteCvSkill(skill: $skill) {\n    id\n    created_at\n    name\n    description\n  }\n}":
    types.DeleteCvSkillDocument,
  "mutation DeleteCv($cv: DeleteCvInput!) {\n  deleteCv(cv: $cv) {\n    affected\n  }\n}":
    types.DeleteCvDocument,
  "query Cv($cvId: ID!) {\n  cv(cvId: $cvId) {\n    id\n    created_at\n    name\n    education\n    description\n    user {\n      id\n      email\n    }\n    projects {\n      id\n      name\n      internal_name\n      description\n      domain\n      start_date\n      end_date\n      environment\n      roles\n      responsibilities\n      project {\n        id\n        name\n        internal_name\n      }\n    }\n    skills {\n      name\n      mastery\n      categoryId\n    }\n    languages {\n      __typename\n    }\n  }\n}":
    types.CvDocument,
  "query Cvs {\n  cvs {\n    id\n    created_at\n    name\n    education\n    description\n    user {\n      id\n      email\n    }\n    projects {\n      __typename\n    }\n    skills {\n      __typename\n    }\n    languages {\n      __typename\n    }\n  }\n}":
    types.CvsDocument,
  "mutation RemoveCvProject($project: RemoveCvProjectInput!) {\n  removeCvProject(project: $project) {\n    id\n    created_at\n    name\n    education\n    description\n    user {\n      id\n      email\n    }\n    projects {\n      id\n      name\n      internal_name\n      description\n      domain\n      start_date\n      end_date\n      environment\n      roles\n      responsibilities\n      project {\n        id\n        name\n        internal_name\n      }\n    }\n    skills {\n      name\n      mastery\n      categoryId\n    }\n    languages {\n      __typename\n    }\n  }\n}":
    types.RemoveCvProjectDocument,
  "mutation UpdateCvProject($project: UpdateCvProjectInput!) {\n  updateCvProject(project: $project) {\n    id\n    created_at\n    name\n    education\n    description\n    user {\n      id\n      email\n    }\n    projects {\n      id\n      name\n      internal_name\n      description\n      domain\n      start_date\n      end_date\n      environment\n      roles\n      responsibilities\n      project {\n        id\n        name\n        internal_name\n      }\n    }\n    skills {\n      name\n      mastery\n      categoryId\n    }\n    languages {\n      __typename\n    }\n  }\n}":
    types.UpdateCvProjectDocument,
  "mutation UpdateCvSkill($skill: UpdateCvSkillInput!) {\n  updateCvSkill(skill: $skill) {\n    id\n    created_at\n    name\n    description\n  }\n}":
    types.UpdateCvSkillDocument,
  "mutation UpdateCv($cv: UpdateCvInput!) {\n  updateCv(cv: $cv) {\n    id\n    created_at\n    name\n    education\n    description\n  }\n}":
    types.UpdateCvDocument,
  "mutation CreateDepartment($department: CreateDepartmentInput!) {\n  createDepartment(department: $department) {\n    id\n    created_at\n    name\n  }\n}":
    types.CreateDepartmentDocument,
  "mutation DeleteDepartment($department: DeleteDepartmentInput!) {\n  deleteDepartment(department: $department) {\n    affected\n  }\n}":
    types.DeleteDepartmentDocument,
  "query Departments {\n  departments {\n    id\n    created_at\n    name\n  }\n}":
    types.DepartmentsDocument,
  "mutation UpdateDepartment($department: UpdateDepartmentInput!) {\n  updateDepartment(department: $department) {\n    id\n    created_at\n    name\n  }\n}":
    types.UpdateDepartmentDocument,
  "mutation ExportPdf($pdf: ExportPdfInput!) {\n  exportPdf(pdf: $pdf)\n}": types.ExportPdfDocument,
  "mutation CreateLanguage($language: CreateLanguageInput!) {\n  createLanguage(language: $language) {\n    id\n    created_at\n    iso2\n    name\n    native_name\n  }\n}":
    types.CreateLanguageDocument,
  "mutation DeleteLanguage($language: DeleteLanguageInput!) {\n  deleteLanguage(language: $language) {\n    affected\n  }\n}":
    types.DeleteLanguageDocument,
  "query Languages {\n  languages {\n    id\n    created_at\n    iso2\n    name\n    native_name\n  }\n}":
    types.LanguagesDocument,
  "mutation UpdateLanguage($language: UpdateLanguageInput!) {\n  updateLanguage(language: $language) {\n    id\n    created_at\n    iso2\n    name\n    native_name\n  }\n}":
    types.UpdateLanguageDocument,
  "mutation VerifyMail($mail: VerifyMailInput!) {\n  verifyMail(mail: $mail)\n}":
    types.VerifyMailDocument,
  "mutation CreatePosition($position: CreatePositionInput!) {\n  createPosition(position: $position) {\n    id\n    created_at\n    name\n  }\n}":
    types.CreatePositionDocument,
  "mutation DeletePosition($position: DeletePositionInput!) {\n  deletePosition(position: $position) {\n    affected\n  }\n}":
    types.DeletePositionDocument,
  "query Positions {\n  positions {\n    id\n    created_at\n    name\n  }\n}":
    types.PositionsDocument,
  "mutation UpdatePosition($position: UpdatePositionInput!) {\n  updatePosition(position: $position) {\n    id\n    created_at\n    name\n  }\n}":
    types.UpdatePositionDocument,
  "mutation AddProfileLanguage($language: AddProfileLanguageInput!) {\n  addProfileLanguage(language: $language) {\n    id\n    created_at\n    languages {\n      name\n      proficiency\n    }\n  }\n}":
    types.AddProfileLanguageDocument,
  "mutation AddProfileSkill($skill: AddProfileSkillInput!) {\n  addProfileSkill(skill: $skill) {\n    id\n    created_at\n    skills {\n      name\n      mastery\n      categoryId\n    }\n  }\n}":
    types.AddProfileSkillDocument,
  "mutation DeleteProfileLanguage($language: DeleteProfileLanguageInput!) {\n  deleteProfileLanguage(language: $language) {\n    id\n    created_at\n    languages {\n      name\n      proficiency\n    }\n  }\n}":
    types.DeleteProfileLanguageDocument,
  "mutation DeleteProfileSkill($skill: DeleteProfileSkillInput!) {\n  deleteProfileSkill(skill: $skill) {\n    id\n    created_at\n    skills {\n      name\n      mastery\n      categoryId\n    }\n  }\n}":
    types.DeleteProfileSkillDocument,
  "query Profile($userId: ID!) {\n  profile(userId: $userId) {\n    id\n    created_at\n    first_name\n    last_name\n    full_name\n    avatar\n    skills {\n      name\n      mastery\n      categoryId\n    }\n    languages {\n      name\n      proficiency\n    }\n  }\n}":
    types.ProfileDocument,
  "mutation UpdateProfileLanguage($language: UpdateProfileLanguageInput!) {\n  updateProfileLanguage(language: $language) {\n    id\n    created_at\n    languages {\n      name\n      proficiency\n    }\n  }\n}":
    types.UpdateProfileLanguageDocument,
  "mutation UpdateProfileSkill($skill: UpdateProfileSkillInput!) {\n  updateProfileSkill(skill: $skill) {\n    id\n    created_at\n    skills {\n      name\n      mastery\n      categoryId\n    }\n  }\n}":
    types.UpdateProfileSkillDocument,
  "mutation UpdateProfile($profile: UpdateProfileInput!) {\n  updateProfile(profile: $profile) {\n    id\n    created_at\n    first_name\n    last_name\n    full_name\n    avatar\n  }\n}":
    types.UpdateProfileDocument,
  "mutation CreateProject($project: CreateProjectInput!) {\n  createProject(project: $project) {\n    id\n    created_at\n    name\n    internal_name\n    domain\n    start_date\n    end_date\n    description\n    environment\n  }\n}":
    types.CreateProjectDocument,
  "mutation DeleteProject($project: DeleteProjectInput!) {\n  deleteProject(project: $project) {\n    affected\n  }\n}":
    types.DeleteProjectDocument,
  "query Project($projectId: ID!) {\n  project(projectId: $projectId) {\n    id\n    created_at\n    name\n    internal_name\n    domain\n    start_date\n    end_date\n    description\n    environment\n  }\n}":
    types.ProjectDocument,
  "query Projects {\n  projects {\n    id\n    created_at\n    name\n    internal_name\n    domain\n    start_date\n    end_date\n    description\n    environment\n  }\n}":
    types.ProjectsDocument,
  "mutation UpdateProject($project: UpdateProjectInput!) {\n  updateProject(project: $project) {\n    id\n    created_at\n    name\n    internal_name\n    domain\n    start_date\n    end_date\n    description\n    environment\n  }\n}":
    types.UpdateProjectDocument,
  "mutation CreateSkill($skill: CreateSkillInput!) {\n  createSkill(skill: $skill) {\n    id\n    created_at\n    name\n    category_name\n    category_parent_name\n  }\n}":
    types.CreateSkillDocument,
  "mutation DeleteSkill($skill: DeleteSkillInput!) {\n  deleteSkill(skill: $skill) {\n    affected\n  }\n}":
    types.DeleteSkillDocument,
  "query SkillCategories {\n  skillCategories {\n    id\n    name\n    order\n    parent {\n      id\n      name\n      order\n    }\n    children {\n      id\n      name\n      order\n    }\n  }\n}":
    types.SkillCategoriesDocument,
  "query Skills {\n  skills {\n    id\n    created_at\n    name\n    category_name\n    category_parent_name\n    category {\n      id\n      name\n      order\n      parent {\n        id\n        name\n        order\n      }\n    }\n  }\n}":
    types.SkillsDocument,
  "mutation UpdateSkill($skill: UpdateSkillInput!) {\n  updateSkill(skill: $skill) {\n    id\n    created_at\n    name\n    category_name\n    category_parent_name\n  }\n}":
    types.UpdateSkillDocument,
  "mutation CreateUser($user: CreateUserInput!) {\n  createUser(user: $user) {\n    id\n    created_at\n    email\n    is_verified\n    role\n  }\n}":
    types.CreateUserDocument,
  "mutation DeleteUser($userId: ID!) {\n  deleteUser(userId: $userId) {\n    affected\n  }\n}":
    types.DeleteUserDocument,
  "query User($userId: ID!) {\n  user(userId: $userId) {\n    id\n    created_at\n    email\n    is_verified\n    role\n    department_name\n    position_name\n    profile {\n      id\n      created_at\n      first_name\n      last_name\n      full_name\n      avatar\n      skills {\n        name\n        mastery\n        categoryId\n      }\n      languages {\n        name\n        proficiency\n      }\n    }\n    department {\n      id\n      created_at\n      name\n    }\n    position {\n      id\n      created_at\n      name\n    }\n    cvs {\n      id\n      created_at\n      name\n      education\n      description\n      user {\n        id\n        email\n        profile {\n          id\n          full_name\n          avatar\n        }\n      }\n    }\n  }\n}":
    types.UserDocument,
  "query Users {\n  users {\n    id\n    created_at\n    email\n    is_verified\n    role\n    department_name\n    position_name\n    profile {\n      id\n      created_at\n      first_name\n      last_name\n      full_name\n      avatar\n    }\n    department {\n      id\n      created_at\n      name\n    }\n    position {\n      id\n      created_at\n      name\n    }\n    cvs {\n      id\n      created_at\n      name\n      description\n    }\n  }\n}":
    types.UsersDocument,
  "mutation UpdateUser($user: UpdateUserInput!) {\n  updateUser(user: $user) {\n    id\n    created_at\n    email\n    is_verified\n    role\n  }\n}":
    types.UpdateUserDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "mutation ForgotPassword($auth: ForgotPasswordInput!) {\n  forgotPassword(auth: $auth)\n}",
): (typeof documents)["mutation ForgotPassword($auth: ForgotPasswordInput!) {\n  forgotPassword(auth: $auth)\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "query Login($auth: AuthInput!) {\n  login(auth: $auth) {\n    user {\n      id\n      created_at\n      email\n      is_verified\n      profile {\n        id\n        first_name\n        last_name\n        full_name\n        avatar\n        skills {\n          name\n          mastery\n        }\n        languages {\n          name\n          proficiency\n        }\n      }\n      cvs {\n        id\n        name\n        education\n        description\n      }\n      department {\n        id\n      }\n      department_name\n      position {\n        id\n      }\n      position_name\n      role\n    }\n    access_token\n    refresh_token\n  }\n}",
): (typeof documents)["query Login($auth: AuthInput!) {\n  login(auth: $auth) {\n    user {\n      id\n      created_at\n      email\n      is_verified\n      profile {\n        id\n        first_name\n        last_name\n        full_name\n        avatar\n        skills {\n          name\n          mastery\n        }\n        languages {\n          name\n          proficiency\n        }\n      }\n      cvs {\n        id\n        name\n        education\n        description\n      }\n      department {\n        id\n      }\n      department_name\n      position {\n        id\n      }\n      position_name\n      role\n    }\n    access_token\n    refresh_token\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "mutation ResetPassword($auth: ResetPasswordInput!) {\n  resetPassword(auth: $auth)\n}",
): (typeof documents)["mutation ResetPassword($auth: ResetPasswordInput!) {\n  resetPassword(auth: $auth)\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "mutation Signup($auth: AuthInput!) {\n  signup(auth: $auth) {\n    user {\n      id\n      created_at\n      email\n      is_verified\n      profile {\n        id\n        first_name\n        last_name\n        full_name\n        avatar\n      }\n      cvs {\n        id\n      }\n      department {\n        id\n      }\n      department_name\n      position {\n        id\n      }\n      position_name\n      role\n    }\n    access_token\n    refresh_token\n  }\n}",
): (typeof documents)["mutation Signup($auth: AuthInput!) {\n  signup(auth: $auth) {\n    user {\n      id\n      created_at\n      email\n      is_verified\n      profile {\n        id\n        first_name\n        last_name\n        full_name\n        avatar\n      }\n      cvs {\n        id\n      }\n      department {\n        id\n      }\n      department_name\n      position {\n        id\n      }\n      position_name\n      role\n    }\n    access_token\n    refresh_token\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "mutation UpdateToken {\n  updateToken {\n    access_token\n    refresh_token\n  }\n}",
): (typeof documents)["mutation UpdateToken {\n  updateToken {\n    access_token\n    refresh_token\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "mutation DeleteAvatar($avatar: DeleteAvatarInput!) {\n  deleteAvatar(avatar: $avatar)\n}",
): (typeof documents)["mutation DeleteAvatar($avatar: DeleteAvatarInput!) {\n  deleteAvatar(avatar: $avatar)\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "mutation UploadAvatar($avatar: UploadAvatarInput!) {\n  uploadAvatar(avatar: $avatar)\n}",
): (typeof documents)["mutation UploadAvatar($avatar: UploadAvatarInput!) {\n  uploadAvatar(avatar: $avatar)\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "mutation AddCvProject($project: AddCvProjectInput!) {\n  addCvProject(project: $project) {\n    id\n    created_at\n    name\n    education\n    description\n    user {\n      id\n      email\n    }\n    projects {\n      id\n      name\n      internal_name\n      description\n      domain\n      start_date\n      end_date\n      environment\n      roles\n      responsibilities\n      project {\n        id\n        name\n        internal_name\n      }\n    }\n    skills {\n      name\n      mastery\n      categoryId\n    }\n    languages {\n      __typename\n    }\n  }\n}",
): (typeof documents)["mutation AddCvProject($project: AddCvProjectInput!) {\n  addCvProject(project: $project) {\n    id\n    created_at\n    name\n    education\n    description\n    user {\n      id\n      email\n    }\n    projects {\n      id\n      name\n      internal_name\n      description\n      domain\n      start_date\n      end_date\n      environment\n      roles\n      responsibilities\n      project {\n        id\n        name\n        internal_name\n      }\n    }\n    skills {\n      name\n      mastery\n      categoryId\n    }\n    languages {\n      __typename\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "mutation AddCvSkill($skill: AddCvSkillInput!) {\n  addCvSkill(skill: $skill) {\n    id\n    created_at\n    name\n    description\n  }\n}",
): (typeof documents)["mutation AddCvSkill($skill: AddCvSkillInput!) {\n  addCvSkill(skill: $skill) {\n    id\n    created_at\n    name\n    description\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "mutation CreateCv($cv: CreateCvInput!) {\n  createCv(cv: $cv) {\n    id\n    created_at\n    name\n    education\n    description\n  }\n}",
): (typeof documents)["mutation CreateCv($cv: CreateCvInput!) {\n  createCv(cv: $cv) {\n    id\n    created_at\n    name\n    education\n    description\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "mutation DeleteCvSkill($skill: DeleteCvSkillInput!) {\n  deleteCvSkill(skill: $skill) {\n    id\n    created_at\n    name\n    description\n  }\n}",
): (typeof documents)["mutation DeleteCvSkill($skill: DeleteCvSkillInput!) {\n  deleteCvSkill(skill: $skill) {\n    id\n    created_at\n    name\n    description\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "mutation DeleteCv($cv: DeleteCvInput!) {\n  deleteCv(cv: $cv) {\n    affected\n  }\n}",
): (typeof documents)["mutation DeleteCv($cv: DeleteCvInput!) {\n  deleteCv(cv: $cv) {\n    affected\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "query Cv($cvId: ID!) {\n  cv(cvId: $cvId) {\n    id\n    created_at\n    name\n    education\n    description\n    user {\n      id\n      email\n    }\n    projects {\n      id\n      name\n      internal_name\n      description\n      domain\n      start_date\n      end_date\n      environment\n      roles\n      responsibilities\n      project {\n        id\n        name\n        internal_name\n      }\n    }\n    skills {\n      name\n      mastery\n      categoryId\n    }\n    languages {\n      __typename\n    }\n  }\n}",
): (typeof documents)["query Cv($cvId: ID!) {\n  cv(cvId: $cvId) {\n    id\n    created_at\n    name\n    education\n    description\n    user {\n      id\n      email\n    }\n    projects {\n      id\n      name\n      internal_name\n      description\n      domain\n      start_date\n      end_date\n      environment\n      roles\n      responsibilities\n      project {\n        id\n        name\n        internal_name\n      }\n    }\n    skills {\n      name\n      mastery\n      categoryId\n    }\n    languages {\n      __typename\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "query Cvs {\n  cvs {\n    id\n    created_at\n    name\n    education\n    description\n    user {\n      id\n      email\n    }\n    projects {\n      __typename\n    }\n    skills {\n      __typename\n    }\n    languages {\n      __typename\n    }\n  }\n}",
): (typeof documents)["query Cvs {\n  cvs {\n    id\n    created_at\n    name\n    education\n    description\n    user {\n      id\n      email\n    }\n    projects {\n      __typename\n    }\n    skills {\n      __typename\n    }\n    languages {\n      __typename\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "mutation RemoveCvProject($project: RemoveCvProjectInput!) {\n  removeCvProject(project: $project) {\n    id\n    created_at\n    name\n    education\n    description\n    user {\n      id\n      email\n    }\n    projects {\n      id\n      name\n      internal_name\n      description\n      domain\n      start_date\n      end_date\n      environment\n      roles\n      responsibilities\n      project {\n        id\n        name\n        internal_name\n      }\n    }\n    skills {\n      name\n      mastery\n      categoryId\n    }\n    languages {\n      __typename\n    }\n  }\n}",
): (typeof documents)["mutation RemoveCvProject($project: RemoveCvProjectInput!) {\n  removeCvProject(project: $project) {\n    id\n    created_at\n    name\n    education\n    description\n    user {\n      id\n      email\n    }\n    projects {\n      id\n      name\n      internal_name\n      description\n      domain\n      start_date\n      end_date\n      environment\n      roles\n      responsibilities\n      project {\n        id\n        name\n        internal_name\n      }\n    }\n    skills {\n      name\n      mastery\n      categoryId\n    }\n    languages {\n      __typename\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "mutation UpdateCvProject($project: UpdateCvProjectInput!) {\n  updateCvProject(project: $project) {\n    id\n    created_at\n    name\n    education\n    description\n    user {\n      id\n      email\n    }\n    projects {\n      id\n      name\n      internal_name\n      description\n      domain\n      start_date\n      end_date\n      environment\n      roles\n      responsibilities\n      project {\n        id\n        name\n        internal_name\n      }\n    }\n    skills {\n      name\n      mastery\n      categoryId\n    }\n    languages {\n      __typename\n    }\n  }\n}",
): (typeof documents)["mutation UpdateCvProject($project: UpdateCvProjectInput!) {\n  updateCvProject(project: $project) {\n    id\n    created_at\n    name\n    education\n    description\n    user {\n      id\n      email\n    }\n    projects {\n      id\n      name\n      internal_name\n      description\n      domain\n      start_date\n      end_date\n      environment\n      roles\n      responsibilities\n      project {\n        id\n        name\n        internal_name\n      }\n    }\n    skills {\n      name\n      mastery\n      categoryId\n    }\n    languages {\n      __typename\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "mutation UpdateCvSkill($skill: UpdateCvSkillInput!) {\n  updateCvSkill(skill: $skill) {\n    id\n    created_at\n    name\n    description\n  }\n}",
): (typeof documents)["mutation UpdateCvSkill($skill: UpdateCvSkillInput!) {\n  updateCvSkill(skill: $skill) {\n    id\n    created_at\n    name\n    description\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "mutation UpdateCv($cv: UpdateCvInput!) {\n  updateCv(cv: $cv) {\n    id\n    created_at\n    name\n    education\n    description\n  }\n}",
): (typeof documents)["mutation UpdateCv($cv: UpdateCvInput!) {\n  updateCv(cv: $cv) {\n    id\n    created_at\n    name\n    education\n    description\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "mutation CreateDepartment($department: CreateDepartmentInput!) {\n  createDepartment(department: $department) {\n    id\n    created_at\n    name\n  }\n}",
): (typeof documents)["mutation CreateDepartment($department: CreateDepartmentInput!) {\n  createDepartment(department: $department) {\n    id\n    created_at\n    name\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "mutation DeleteDepartment($department: DeleteDepartmentInput!) {\n  deleteDepartment(department: $department) {\n    affected\n  }\n}",
): (typeof documents)["mutation DeleteDepartment($department: DeleteDepartmentInput!) {\n  deleteDepartment(department: $department) {\n    affected\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "query Departments {\n  departments {\n    id\n    created_at\n    name\n  }\n}",
): (typeof documents)["query Departments {\n  departments {\n    id\n    created_at\n    name\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "mutation UpdateDepartment($department: UpdateDepartmentInput!) {\n  updateDepartment(department: $department) {\n    id\n    created_at\n    name\n  }\n}",
): (typeof documents)["mutation UpdateDepartment($department: UpdateDepartmentInput!) {\n  updateDepartment(department: $department) {\n    id\n    created_at\n    name\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "mutation ExportPdf($pdf: ExportPdfInput!) {\n  exportPdf(pdf: $pdf)\n}",
): (typeof documents)["mutation ExportPdf($pdf: ExportPdfInput!) {\n  exportPdf(pdf: $pdf)\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "mutation CreateLanguage($language: CreateLanguageInput!) {\n  createLanguage(language: $language) {\n    id\n    created_at\n    iso2\n    name\n    native_name\n  }\n}",
): (typeof documents)["mutation CreateLanguage($language: CreateLanguageInput!) {\n  createLanguage(language: $language) {\n    id\n    created_at\n    iso2\n    name\n    native_name\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "mutation DeleteLanguage($language: DeleteLanguageInput!) {\n  deleteLanguage(language: $language) {\n    affected\n  }\n}",
): (typeof documents)["mutation DeleteLanguage($language: DeleteLanguageInput!) {\n  deleteLanguage(language: $language) {\n    affected\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "query Languages {\n  languages {\n    id\n    created_at\n    iso2\n    name\n    native_name\n  }\n}",
): (typeof documents)["query Languages {\n  languages {\n    id\n    created_at\n    iso2\n    name\n    native_name\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "mutation UpdateLanguage($language: UpdateLanguageInput!) {\n  updateLanguage(language: $language) {\n    id\n    created_at\n    iso2\n    name\n    native_name\n  }\n}",
): (typeof documents)["mutation UpdateLanguage($language: UpdateLanguageInput!) {\n  updateLanguage(language: $language) {\n    id\n    created_at\n    iso2\n    name\n    native_name\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "mutation VerifyMail($mail: VerifyMailInput!) {\n  verifyMail(mail: $mail)\n}",
): (typeof documents)["mutation VerifyMail($mail: VerifyMailInput!) {\n  verifyMail(mail: $mail)\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "mutation CreatePosition($position: CreatePositionInput!) {\n  createPosition(position: $position) {\n    id\n    created_at\n    name\n  }\n}",
): (typeof documents)["mutation CreatePosition($position: CreatePositionInput!) {\n  createPosition(position: $position) {\n    id\n    created_at\n    name\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "mutation DeletePosition($position: DeletePositionInput!) {\n  deletePosition(position: $position) {\n    affected\n  }\n}",
): (typeof documents)["mutation DeletePosition($position: DeletePositionInput!) {\n  deletePosition(position: $position) {\n    affected\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "query Positions {\n  positions {\n    id\n    created_at\n    name\n  }\n}",
): (typeof documents)["query Positions {\n  positions {\n    id\n    created_at\n    name\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "mutation UpdatePosition($position: UpdatePositionInput!) {\n  updatePosition(position: $position) {\n    id\n    created_at\n    name\n  }\n}",
): (typeof documents)["mutation UpdatePosition($position: UpdatePositionInput!) {\n  updatePosition(position: $position) {\n    id\n    created_at\n    name\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "mutation AddProfileLanguage($language: AddProfileLanguageInput!) {\n  addProfileLanguage(language: $language) {\n    id\n    created_at\n    languages {\n      name\n      proficiency\n    }\n  }\n}",
): (typeof documents)["mutation AddProfileLanguage($language: AddProfileLanguageInput!) {\n  addProfileLanguage(language: $language) {\n    id\n    created_at\n    languages {\n      name\n      proficiency\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "mutation AddProfileSkill($skill: AddProfileSkillInput!) {\n  addProfileSkill(skill: $skill) {\n    id\n    created_at\n    skills {\n      name\n      mastery\n      categoryId\n    }\n  }\n}",
): (typeof documents)["mutation AddProfileSkill($skill: AddProfileSkillInput!) {\n  addProfileSkill(skill: $skill) {\n    id\n    created_at\n    skills {\n      name\n      mastery\n      categoryId\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "mutation DeleteProfileLanguage($language: DeleteProfileLanguageInput!) {\n  deleteProfileLanguage(language: $language) {\n    id\n    created_at\n    languages {\n      name\n      proficiency\n    }\n  }\n}",
): (typeof documents)["mutation DeleteProfileLanguage($language: DeleteProfileLanguageInput!) {\n  deleteProfileLanguage(language: $language) {\n    id\n    created_at\n    languages {\n      name\n      proficiency\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "mutation DeleteProfileSkill($skill: DeleteProfileSkillInput!) {\n  deleteProfileSkill(skill: $skill) {\n    id\n    created_at\n    skills {\n      name\n      mastery\n      categoryId\n    }\n  }\n}",
): (typeof documents)["mutation DeleteProfileSkill($skill: DeleteProfileSkillInput!) {\n  deleteProfileSkill(skill: $skill) {\n    id\n    created_at\n    skills {\n      name\n      mastery\n      categoryId\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "query Profile($userId: ID!) {\n  profile(userId: $userId) {\n    id\n    created_at\n    first_name\n    last_name\n    full_name\n    avatar\n    skills {\n      name\n      mastery\n      categoryId\n    }\n    languages {\n      name\n      proficiency\n    }\n  }\n}",
): (typeof documents)["query Profile($userId: ID!) {\n  profile(userId: $userId) {\n    id\n    created_at\n    first_name\n    last_name\n    full_name\n    avatar\n    skills {\n      name\n      mastery\n      categoryId\n    }\n    languages {\n      name\n      proficiency\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "mutation UpdateProfileLanguage($language: UpdateProfileLanguageInput!) {\n  updateProfileLanguage(language: $language) {\n    id\n    created_at\n    languages {\n      name\n      proficiency\n    }\n  }\n}",
): (typeof documents)["mutation UpdateProfileLanguage($language: UpdateProfileLanguageInput!) {\n  updateProfileLanguage(language: $language) {\n    id\n    created_at\n    languages {\n      name\n      proficiency\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "mutation UpdateProfileSkill($skill: UpdateProfileSkillInput!) {\n  updateProfileSkill(skill: $skill) {\n    id\n    created_at\n    skills {\n      name\n      mastery\n      categoryId\n    }\n  }\n}",
): (typeof documents)["mutation UpdateProfileSkill($skill: UpdateProfileSkillInput!) {\n  updateProfileSkill(skill: $skill) {\n    id\n    created_at\n    skills {\n      name\n      mastery\n      categoryId\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "mutation UpdateProfile($profile: UpdateProfileInput!) {\n  updateProfile(profile: $profile) {\n    id\n    created_at\n    first_name\n    last_name\n    full_name\n    avatar\n  }\n}",
): (typeof documents)["mutation UpdateProfile($profile: UpdateProfileInput!) {\n  updateProfile(profile: $profile) {\n    id\n    created_at\n    first_name\n    last_name\n    full_name\n    avatar\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "mutation CreateProject($project: CreateProjectInput!) {\n  createProject(project: $project) {\n    id\n    created_at\n    name\n    internal_name\n    domain\n    start_date\n    end_date\n    description\n    environment\n  }\n}",
): (typeof documents)["mutation CreateProject($project: CreateProjectInput!) {\n  createProject(project: $project) {\n    id\n    created_at\n    name\n    internal_name\n    domain\n    start_date\n    end_date\n    description\n    environment\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "mutation DeleteProject($project: DeleteProjectInput!) {\n  deleteProject(project: $project) {\n    affected\n  }\n}",
): (typeof documents)["mutation DeleteProject($project: DeleteProjectInput!) {\n  deleteProject(project: $project) {\n    affected\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "query Project($projectId: ID!) {\n  project(projectId: $projectId) {\n    id\n    created_at\n    name\n    internal_name\n    domain\n    start_date\n    end_date\n    description\n    environment\n  }\n}",
): (typeof documents)["query Project($projectId: ID!) {\n  project(projectId: $projectId) {\n    id\n    created_at\n    name\n    internal_name\n    domain\n    start_date\n    end_date\n    description\n    environment\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "query Projects {\n  projects {\n    id\n    created_at\n    name\n    internal_name\n    domain\n    start_date\n    end_date\n    description\n    environment\n  }\n}",
): (typeof documents)["query Projects {\n  projects {\n    id\n    created_at\n    name\n    internal_name\n    domain\n    start_date\n    end_date\n    description\n    environment\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "mutation UpdateProject($project: UpdateProjectInput!) {\n  updateProject(project: $project) {\n    id\n    created_at\n    name\n    internal_name\n    domain\n    start_date\n    end_date\n    description\n    environment\n  }\n}",
): (typeof documents)["mutation UpdateProject($project: UpdateProjectInput!) {\n  updateProject(project: $project) {\n    id\n    created_at\n    name\n    internal_name\n    domain\n    start_date\n    end_date\n    description\n    environment\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "mutation CreateSkill($skill: CreateSkillInput!) {\n  createSkill(skill: $skill) {\n    id\n    created_at\n    name\n    category_name\n    category_parent_name\n  }\n}",
): (typeof documents)["mutation CreateSkill($skill: CreateSkillInput!) {\n  createSkill(skill: $skill) {\n    id\n    created_at\n    name\n    category_name\n    category_parent_name\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "mutation DeleteSkill($skill: DeleteSkillInput!) {\n  deleteSkill(skill: $skill) {\n    affected\n  }\n}",
): (typeof documents)["mutation DeleteSkill($skill: DeleteSkillInput!) {\n  deleteSkill(skill: $skill) {\n    affected\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "query SkillCategories {\n  skillCategories {\n    id\n    name\n    order\n    parent {\n      id\n      name\n      order\n    }\n    children {\n      id\n      name\n      order\n    }\n  }\n}",
): (typeof documents)["query SkillCategories {\n  skillCategories {\n    id\n    name\n    order\n    parent {\n      id\n      name\n      order\n    }\n    children {\n      id\n      name\n      order\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "query Skills {\n  skills {\n    id\n    created_at\n    name\n    category_name\n    category_parent_name\n    category {\n      id\n      name\n      order\n      parent {\n        id\n        name\n        order\n      }\n    }\n  }\n}",
): (typeof documents)["query Skills {\n  skills {\n    id\n    created_at\n    name\n    category_name\n    category_parent_name\n    category {\n      id\n      name\n      order\n      parent {\n        id\n        name\n        order\n      }\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "mutation UpdateSkill($skill: UpdateSkillInput!) {\n  updateSkill(skill: $skill) {\n    id\n    created_at\n    name\n    category_name\n    category_parent_name\n  }\n}",
): (typeof documents)["mutation UpdateSkill($skill: UpdateSkillInput!) {\n  updateSkill(skill: $skill) {\n    id\n    created_at\n    name\n    category_name\n    category_parent_name\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "mutation CreateUser($user: CreateUserInput!) {\n  createUser(user: $user) {\n    id\n    created_at\n    email\n    is_verified\n    role\n  }\n}",
): (typeof documents)["mutation CreateUser($user: CreateUserInput!) {\n  createUser(user: $user) {\n    id\n    created_at\n    email\n    is_verified\n    role\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "mutation DeleteUser($userId: ID!) {\n  deleteUser(userId: $userId) {\n    affected\n  }\n}",
): (typeof documents)["mutation DeleteUser($userId: ID!) {\n  deleteUser(userId: $userId) {\n    affected\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "query User($userId: ID!) {\n  user(userId: $userId) {\n    id\n    created_at\n    email\n    is_verified\n    role\n    department_name\n    position_name\n    profile {\n      id\n      created_at\n      first_name\n      last_name\n      full_name\n      avatar\n      skills {\n        name\n        mastery\n        categoryId\n      }\n      languages {\n        name\n        proficiency\n      }\n    }\n    department {\n      id\n      created_at\n      name\n    }\n    position {\n      id\n      created_at\n      name\n    }\n    cvs {\n      id\n      created_at\n      name\n      education\n      description\n      user {\n        id\n        email\n        profile {\n          id\n          full_name\n          avatar\n        }\n      }\n    }\n  }\n}",
): (typeof documents)["query User($userId: ID!) {\n  user(userId: $userId) {\n    id\n    created_at\n    email\n    is_verified\n    role\n    department_name\n    position_name\n    profile {\n      id\n      created_at\n      first_name\n      last_name\n      full_name\n      avatar\n      skills {\n        name\n        mastery\n        categoryId\n      }\n      languages {\n        name\n        proficiency\n      }\n    }\n    department {\n      id\n      created_at\n      name\n    }\n    position {\n      id\n      created_at\n      name\n    }\n    cvs {\n      id\n      created_at\n      name\n      education\n      description\n      user {\n        id\n        email\n        profile {\n          id\n          full_name\n          avatar\n        }\n      }\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "query Users {\n  users {\n    id\n    created_at\n    email\n    is_verified\n    role\n    department_name\n    position_name\n    profile {\n      id\n      created_at\n      first_name\n      last_name\n      full_name\n      avatar\n    }\n    department {\n      id\n      created_at\n      name\n    }\n    position {\n      id\n      created_at\n      name\n    }\n    cvs {\n      id\n      created_at\n      name\n      description\n    }\n  }\n}",
): (typeof documents)["query Users {\n  users {\n    id\n    created_at\n    email\n    is_verified\n    role\n    department_name\n    position_name\n    profile {\n      id\n      created_at\n      first_name\n      last_name\n      full_name\n      avatar\n    }\n    department {\n      id\n      created_at\n      name\n    }\n    position {\n      id\n      created_at\n      name\n    }\n    cvs {\n      id\n      created_at\n      name\n      description\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "mutation UpdateUser($user: UpdateUserInput!) {\n  updateUser(user: $user) {\n    id\n    created_at\n    email\n    is_verified\n    role\n  }\n}",
): (typeof documents)["mutation UpdateUser($user: UpdateUserInput!) {\n  updateUser(user: $user) {\n    id\n    created_at\n    email\n    is_verified\n    role\n  }\n}"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> =
  TDocumentNode extends DocumentNode<infer TType, any> ? TType : never;
