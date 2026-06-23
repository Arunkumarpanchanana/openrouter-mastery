#!/usr/bin/env python3
"""Transform session HTML files from single-scroll to tabbed layout."""

import glob
import os
import re
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SESSION_DIRS = [
    'sessions/beginner',
    'sessions/intermediate',
    'sessions/expert',
]

TAB_BAR = '''    <div class="tab-bar" role="tablist">
      <button class="tab-btn active" role="tab" aria-selected="true" data-tab="learn" onclick="switchTab('learn')">\U0001f4d6 Learn</button>
      <button class="tab-btn" role="tab" aria-selected="false" data-tab="lab" onclick="switchTab('lab')">\U0001f52c Lab</button>
      <button class="tab-btn" role="tab" aria-selected="false" data-tab="quiz" onclick="switchTab('quiz')">\U0001f4dd Quiz</button>
    </div>'''

SESSION_JS_REF = '\n  <script src="../../assets/js/session.js"></script>'
PROGRESS_JS_PATTERN = '<script src="../../assets/js/progress.js"></script>'


def transform_quiz(html):
    """Add data-correct to quiz labels and remove <details> answer blocks."""
    def process_question(match):
        before_details = match.group(1)
        details_content = match.group(2)

        letter_match = re.search(r'<strong>([a-dA-D])</strong>', details_content)
        if not letter_match:
            return match.group(0)

        correct_letter = letter_match.group(1).lower()

        def add_correct(label_match):
            label = label_match.group(0)
            if re.search(rf'\bvalue="{re.escape(correct_letter)}"', label):
                return label.replace(
                    '<label class="quiz-option"',
                    '<label class="quiz-option" data-correct="true"'
                )
            return label

        before_details = re.sub(
            r'<label class="quiz-option".*?</label>',
            add_correct,
            before_details,
            flags=re.DOTALL
        )

        return f'<div class="quiz-question">{before_details}</div>'

    html = re.sub(
        r'<div class="quiz-question">(.*?)<details class="quiz-answer">(.*?)</details>\s*</div>',
        process_question,
        html,
        flags=re.DOTALL
    )
    return html


def remove_page_nav(html):
    """Remove old page-nav elements."""
    return re.sub(
        r'\s*<nav class="page-nav">.*?</nav>',
        '',
        html,
        flags=re.DOTALL
    )


def remove_tab_bars(html):
    """Remove any existing tab-bar elements."""
    return re.sub(
        r'\s*<div class="tab-bar" role="tablist">.*?</div>',
        '',
        html,
        flags=re.DOTALL
    )


def add_tab_bar(html):
    """Insert tab-bar div after the session-meta div."""
    if '<div class="tab-bar"' in html:
        return html
    return re.sub(
        r'(<div class="session-meta">.*?</div>)',
        r'\1\n' + TAB_BAR,
        html,
        flags=re.DOTALL
    )


def wrap_sections(html):
    """Wrap learn/lab/quiz sections in tab-content divs (preserving original section)."""
    def wrap_section(match):
        section_id = match.group(1)
        section_html = match.group(0)
        active = ' active' if section_id == 'learn' else ''
        return f'<div id="tab-{section_id}" class="tab-content{active}" role="tabpanel">{section_html}</div>'

    html = re.sub(
        r'<section id="(learn|lab|quiz)"[^>]*>.*?</section>',
        wrap_section,
        html,
        flags=re.DOTALL
    )
    return html


def add_session_js(html):
    """Add session.js reference after progress.js if not already present."""
    html = re.sub(r'\s*<script src="../../assets/js/session\.js"></script>', '', html)
    return html.replace(PROGRESS_JS_PATTERN, PROGRESS_JS_PATTERN + SESSION_JS_REF)


def transform_file(filepath):
    """Apply all transforms to a single HTML file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    html = remove_tab_bars(html)
    html = transform_quiz(html)
    html = remove_page_nav(html)
    html = add_tab_bar(html)
    html = wrap_sections(html)
    html = add_session_js(html)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)


def collect_files():
    """Collect all session HTML files."""
    files = []
    for d in SESSION_DIRS:
        pattern = os.path.join(BASE_DIR, d, '*.html')
        files.extend(glob.glob(pattern))
    return sorted(files)


def main():
    files = collect_files()
    print(f'Found {len(files)} session files to transform')

    for fp in files:
        relpath = os.path.relpath(fp, BASE_DIR)
        print(f'  Transforming {relpath}...')
        try:
            transform_file(fp)
        except Exception as e:
            print(f'  ERROR transforming {relpath}: {e}', file=sys.stderr)

    print('Done.')


if __name__ == '__main__':
    main()
