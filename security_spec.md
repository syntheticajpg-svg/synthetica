# 🛡️ Firestore Security Specification (security_spec.md)

This document maps out our Firestore security guarantees, data invariants, and verification criteria to comply with a zero-trust architecture.

## 1. Data Invariants & Access Control

1. **Student Profiles (`/students/{studentId}`)**:
   - Authorized administrative users can perform all actions (`read`, `write`).
   - Authenticated student users can only read (`get`) their own profile. They cannot write/update permissions (`allowedCourses`, `allowedModules`, etc.) or read other student profiles.

2. **Submissions (`/submissions/{submissionId}`)**:
   - Authorized administrative users can read and write (review, update comment, change rating).
   - Authenticated student users can create a submission (provided they own it: `studentId == request.auth.uid`), read their own submissions, but cannot update or delete them (unless doing a student action if custom logic allows, otherwise locked after submit).
   - Non-authenticated requests are strictly denied.

3. **Admin Directory (`/admins/{adminId}`)**:
   - Readable and writable only by authorized system admins or existing admin overrides.

---

## 2. The "Dirty Dozen" (Malicious Attack Payloads)

Each of these payloads is designed to violate system specifications and MUST trigger a `PERMISSION_DENIED` rejection:

1. **Email Spoofing / Identity Hijack** (Writing student document with a mismatched auth ID):
   - Collection: `/students/attacker_id` -> payload fields with `id: student_victim` or client trying to edit someone else's record.
2. **Privilege Escalation via Profile Registration**:
   - Creating or updating a profile setting `allowedCourses = ["all"]` as a regular student.
3. **Ghost Field Injection** (Shadow update adding unwhitelisted `isAdmin` flag to a custom profile).
4. **Denial of Wallet payload check** (Too long String/ID injection in `/submissions`).
5. **PII Blanket Scraping** (A student trying to do a bulk list query on `/students`).
6. **Submission Impersonation** (Submitting homework on behalf of another student ID).
7. **Bypassing Review Status** (Student trying to mark status of their submission as `"reviewed"` or changing rating).
8. **Malicious Admin Creation** (Adding arbitrary doc to `/admins` by non-admin).
9. **Tampering with Temporal Integrity** (Writing arbitrary values to timestamp fields like `submittedAt` instead of validating against `request.time`).
10. **Modification of Immutable Fields** (Attempting to modify `id` or `studentId` of existing resources during update).
11. **Orphaned Writes** (Submitting task with an invalid courseId that is not in the system/allowed list).
12. **Status/Outcome Shortcutting** (Changing review comments without proper administrative credentials).

---

## 3. Firestore Rules draft (`DRAFT_firestore.rules`)

We will compile and assert these rules in the next steps using the zero-trust ABAC patterns.
