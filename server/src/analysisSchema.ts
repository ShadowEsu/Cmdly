import { z } from "zod";

export const AnalysisResultSchema = z.object({
  source_platform: z.enum(["gradescope", "canvas", "paper", "mixed", "unknown"]),
  image_types_detected: z.array(z.string()),
  scoring_method: z.enum(["negative", "positive", "unknown"]),
  assignment: z.object({
    title: z.string().nullable(),
    subject: z.string().nullable(),
    assignment_type: z.enum(["problem_set", "exam", "lab_report", "essay", "worksheet", "quiz", "project", "other"]),
    total_score_earned: z.number().nullable(),
    total_score_possible: z.number().nullable(),
    total_score_display: z.string().nullable(),
    percentage: z.number().nullable(),
    letter_grade: z.string().nullable()
  }),
  questions: z.array(
    z.object({
      question_id: z.string(),
      question_description: z.string().nullable(),
      points_possible: z.number().nullable(),
      points_earned: z.number().nullable(),
      points_lost: z.number().nullable(),
      scoring_direction: z.enum(["deducted_from_full", "added_from_zero", "unknown"]),
      rubric_items_applied: z.array(
        z.object({
          description: z.string(),
          point_value: z.number(),
          was_applied_to_student: z.boolean(),
          has_explanation: z.boolean()
        })
      ),
      professor_comments: z.array(
        z.object({
          comment_text: z.string(),
          location: z.enum(["on_submission", "side_panel", "separate_page", "unknown"]),
          references_specific_part: z.boolean()
        })
      ),
      deductions_with_no_comment: z.boolean(),
      partial_credit_awarded: z.boolean()
    })
  ),
  overall_professor_comments: z.string().nullable(),
  teacher_profile: z.object({
    grading_style: z.enum(["generous", "moderate", "harsh", "inconsistent"]),
    grading_style_evidence: z.string(),
    uses_rubric_consistently: z.boolean(),
    feedback_quality: z.enum(["detailed", "adequate", "minimal", "absent"]),
    feedback_quality_explanation: z.string(),
    deduction_pattern: z.enum(["rubric_based", "comment_based", "unexplained", "mixed"]),
    typical_ceiling_estimate: z.number().nullable(),
    marking_philosophy: z.enum(["perfectionist", "standards_based", "effort_rewarding", "outcome_focused", "unclear"])
  }),
  case_analysis: z.object({
    rubric_alignment_score: z.number(),
    fairness_review: z
      .object({
        appears_internally_consistent: z.boolean().nullable(),
        summary_if_marking_sound: z.string(),
        summary_if_marking_questionable: z.string(),
        teacher_may_have_erred_because: z.string().nullable(),
        student_should_know: z.string()
      })
      .optional(),
    unexplained_deductions: z.array(
      z.object({
        question_id: z.string(),
        points_lost: z.number(),
        what_is_missing: z.string()
      })
    ),
    potential_calculation_errors: z.array(
      z.object({
        question_id: z.string(),
        expected_score: z.number(),
        actual_score_shown: z.number(),
        discrepancy: z.number(),
        explanation: z.string()
      })
    ),
    is_marked_correctly_but_harshly: z.boolean(),
    correctly_but_harshly_explanation: z.string(),
    strongest_appeal_points: z.array(z.string()),
    weakest_appeal_points: z.array(z.string()),
    overall_case_strength: z.enum(["strong", "moderate", "weak", "no_case"]),
    case_strength_reason: z.string(),
    recommended_appeal_angle: z.enum([
      "calculation_error",
      "unexplained_deduction",
      "rubric_misapplication",
      "inconsistent_standard",
      "clarification_only",
      "none"
    ])
  }),
  confidence: z.object({
    overall_confidence: z.number(),
    low_confidence_items: z.array(z.string()),
    requires_retake: z.boolean(),
    retake_reason: z.string().nullable()
  })
});
