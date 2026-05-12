You are working on Regrade, a production app that helps students appeal unfair grades. We need an evaluation harness to test the AI analysis pipeline. Your task is to generate synthetic fixtures: graded assignment files with matching ground-truth JSON, so we can run CI tests against the analysis pipeline.
Token efficiency rules, non-negotiable:
Use the minimum tokens necessary. Do not pad responses with preambles, summaries, or recaps. Do not explain what you are about to do, just do it. Do not restate the task. Do not apologize. Do not use phrases like "I'll help you with that" or "Let me know if you need anything else." Skip closing remarks entirely. When you finish a file, output the file content and move to the next. No commentary between files unless something genuinely requires a decision from me.
If a step is obvious, do it silently. Only surface information when I need to act on it. Compress your thinking. Long internal reasoning is fine, long output is not.
When generating code, write the code only. No surrounding explanation unless I asked for it. When generating fixture data, write the data only.
If you need to ask me something, ask one specific question, not three open-ended ones. If you can make a reasonable default choice, make it and tell me in one line what you chose.
Your task:
Generate 30 synthetic graded assignment fixtures in /fixtures/synthetic/. Each fixture is a pair: a PDF or PNG of the graded work, and a matching JSON file with the ground-truth analysis output.
Cover these dimensions across the 30 fixtures:
Platforms: Canvas SpeedGrader screenshot, Gradescope graded copy PDF, Moodle feedback view, Blackboard Ultra annotation, Turnitin Feedback Studio export, Google Classroom returned Doc, D2L Brightspace feedback, paper photo with handwritten marks, photo of a phone showing a grade in an LMS.
Subjects: calculus, organic chemistry, intro CS Python, English literature essay, world history short answer, physics with diagrams, statistics, linguistics, intro economics, art critique.
Deduction categories, distribute roughly evenly: genuine student error (fair grade, no appeal warranted), rubric mismatch, unexplained deduction, arithmetic error in teacher totaling, misread handwriting, work shown but not credited, partial credit not applied, inconsistent grading within the same paper, feedback contradicts rubric, late penalty applied incorrectly, accommodations not applied, Turnitin false-positive plagiarism flag.
Generate fixtures using HTML and CSS rendered to PDF via Puppeteer or Playwright for LMS screenshots. Use Pillow for paper-photo synthesis with handwriting fonts (Caveat, Kalam, Homemade Apple from Google Fonts). For red-pen teacher marks, overlay strokes using SVG or generated paths with slight randomness so marks don't look identical.
Fixture file structure:
/fixtures/synthetic/
  canvas_calc_001.pdf
  canvas_calc_001.json
  gradescope_chem_002.pdf
  gradescope_chem_002.json
  ...
JSON schema for each fixture:
json{
  "fixture_id": "canvas_calc_001",
  "platform": "canvas",
  "subject": "calculus",
  "deduction_category": "unexplained_deduction",
  "expected_analysis": {
    "total_points_possible": 100,
    "total_points_awarded": 82,
    "platform_identified_correctly": "canvas",
    "rubric_extracted": true,
    "questions": [
      {
        "id": "Q1",
        "points_possible": 25,
        "points_awarded": 25,
        "cause_category": "marked_correctly",
        "appeal_strength": "none"
      },
      {
        "id": "Q2",
        "points_possible": 25,
        "points_awarded": 22,
        "points_lost": 3,
        "cause_category": "unexplained_deduction",
        "appeal_strength": "high",
        "evidence": "Q2 shows 'see rubric' as the only comment. Rubric criterion 'Setup' awards full credit when the equation is correct. Equation is correct. No criterion justifies the 3-point deduction."
      }
    ],
    "missing_information": [],
    "appeal_recommended": true,
    "confidence": 0.92
  },
  "notes_for_evaluator": "Tests whether the pipeline correctly identifies an unexplained deduction when the only feedback is a generic 'see rubric' phrase."
}
Steps to execute, in order:

Create /fixtures/synthetic/ directory if it does not exist.
Create /fixtures/synthetic/README.md with a one-paragraph description and the schema definition.
Create a generate_fixtures.ts script in /scripts/ that produces the 30 fixtures programmatically. Use realistic but fake names like "Alex Chen" or "Maya Patel," fake course codes like "MATH 2A" or "CHEM 101," fake professor names like "Prof. Lee" or "Dr. Okafor." Vary names across cultures since the user base is global.
Run the script. Verify all 60 files (30 PDFs/PNGs plus 30 JSONs) exist.
Output a single summary line at the end: total fixtures created, breakdown by platform, breakdown by deduction category. Nothing else.

Constraints:
Do not commit fixtures with any real student data, real names from public figures, or recognizable institution logos. Use generic colors and layouts that resemble each platform without copying their exact branding.
Keep handwriting realistic by varying font, size, slight rotation per character (1 to 4 degrees), and ink opacity (0.7 to 1.0) so two marks never look identical.
For deduction categories where the appeal is weak or unwarranted (genuine student error), make the ground truth clearly mark appeal_recommended: false so we can test that the pipeline does not push weak appeals.
Include at least 3 fixtures with multi-page submissions and 2 fixtures with very low image quality (blur, glare, rotation) to test the missing-information detection.
When you finish:
Output one line: Done. N fixtures in /fixtures/synthetic/. Breakdown: [platform counts] [category counts].
Do not summarize what you built. Do not suggest next steps unless I ask. Do not write a closing paragraph.