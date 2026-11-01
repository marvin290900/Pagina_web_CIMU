#!/usr/bin/env python3
"""Render docs/manual-roles-permisos.md to a shareable PDF.

Requires reportlab. The Markdown file is the single source of the manual.
Usage: python3 scripts/generate-role-manual.py [--output output/pdf/manual-roles-permisos-cimu.pdf]
"""
from __future__ import annotations

import argparse
import html
import re
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate, Flowable, Frame, KeepTogether, PageBreak,
    PageTemplate, Paragraph, Spacer, Table, TableStyle,
)
from reportlab.platypus.tableofcontents import TableOfContents

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'docs/manual-roles-permisos.md'
INK = colors.HexColor('#1C3039')
TEAL = colors.HexColor('#176B5C')
MUTED = colors.HexColor('#62767E')
LINE = colors.HexColor('#DDE8E3')
PALE = colors.HexColor('#EFF6F2')
PAGE_W, PAGE_H = A4
MARGIN = 48
WIDTH = PAGE_W - 2 * MARGIN


def register_fonts():
    base = Path('/usr/share/fonts/truetype/dejavu')
    for suffix, filename in [('', 'DejaVuSans.ttf'), ('Bold', 'DejaVuSans-Bold.ttf'),
                             ('Italic', 'DejaVuSans-Oblique.ttf'), ('BoldItalic', 'DejaVuSans-BoldOblique.ttf')]:
        pdfmetrics.registerFont(TTFont('ManualSans' + suffix, str(base / filename)))
    pdfmetrics.registerFontFamily('ManualSans', normal='ManualSans', bold='ManualSansBold',
                                 italic='ManualSansItalic', boldItalic='ManualSansBoldItalic')
    pdfmetrics.registerFont(TTFont('ManualMono', str(base / 'DejaVuSansMono.ttf')))


def make_styles():
    base = dict(fontName='ManualSans', fontSize=9.1, leading=13.5, textColor=INK,
                alignment=TA_LEFT, splitLongWords=True)
    body = ParagraphStyle('Body', spaceAfter=8, **base)
    return {
        'body': body,
        'cover': ParagraphStyle('CoverTitle', parent=body, fontName='ManualSansBold', fontSize=30,
                                leading=37, spaceAfter=23, textColor=INK),
        'section': ParagraphStyle('SectionTitle', parent=body, fontName='ManualSansBold', fontSize=20,
                                  leading=26, spaceBefore=0, spaceAfter=18, keepWithNext=True),
        'sub': ParagraphStyle('Subheading', parent=body, fontName='ManualSansBold', fontSize=11,
                              leading=15.5, textColor=TEAL, spaceBefore=10, spaceAfter=8, keepWithNext=True),
        'bullet': ParagraphStyle('Bullet', parent=body, leftIndent=12, firstLineIndent=0,
                                 bulletIndent=0, bulletFontName='ManualSans', bulletFontSize=9, spaceAfter=6),
        'number': ParagraphStyle('Number', parent=body, leftIndent=15, firstLineIndent=-15, spaceAfter=6),
        'cell': ParagraphStyle('Cell', parent=body, fontSize=7.8, leading=10.7, spaceAfter=0),
        'th': ParagraphStyle('TableHeading', parent=body, fontName='ManualSansBold', fontSize=7.6,
                             leading=10.1, textColor=colors.white, spaceAfter=0),
        'note': ParagraphStyle('Callout', parent=body, fontSize=9, leading=13.2, textColor=TEAL, spaceAfter=0),
        'toc': ParagraphStyle('Contents', parent=body, fontSize=10, leading=15, spaceBefore=11,
                              spaceAfter=6, rightIndent=20),
    }


def inline(text):
    text = html.escape(text, quote=False)
    text = re.sub(r'`([^`]+)`', r'<font name="ManualMono" size="7.4">\1</font>', text)
    text = re.sub(r'\*\*([^*]+)\*\*', r'<b>\1</b>', text)
    return text


class Workflow(Flowable):
    def __init__(self, width):
        super().__init__()
        self.width, self.height = width, 55

    def draw(self):
        c = self.canv
        gap = 5
        unit = (self.width - 3 * gap) / 4
        stages = [('Borrador', '#EDF1F4', '#516773'), ('En revisión', '#F8F1DE', '#8B6C23'),
                  ('Aprobado', '#E9EEF9', '#5369A0'), ('Publicado', '#E2F1E8', '#226747')]
        for i, (label, bg, fg) in enumerate(stages):
            x, y, h = i * (unit + gap), 13, 34
            c.setFillColor(colors.HexColor(bg))
            p = c.beginPath()
            p.moveTo(x, y)
            p.lineTo(x + unit - 9, y)
            p.lineTo(x + unit, y + h / 2)
            p.lineTo(x + unit - 9, y + h)
            p.lineTo(x, y + h)
            if i:
                p.lineTo(x + 9, y + h / 2)
            p.close()
            c.drawPath(p, fill=1, stroke=0)
            c.setFillColor(colors.HexColor(fg))
            c.setFont('ManualSansBold', 8)
            c.drawCentredString(x + unit / 2, y + 13, label)


class ManualDoc(BaseDocTemplate):
    def __init__(self, filename):
        super().__init__(str(filename), pagesize=A4, leftMargin=MARGIN, rightMargin=MARGIN,
                         topMargin=64, bottomMargin=54, title='Manual de roles, permisos y flujo editorial - CIMU',
                         author='CIMU', subject='Guía de uso de cuentas, roles, alcances y estados editoriales')
        self.section_pages = []
        frame = Frame(MARGIN, self.bottomMargin, WIDTH, PAGE_H - self.topMargin - self.bottomMargin,
                      leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0, id='body')
        self.addPageTemplates(PageTemplate(id='manual', frames=[frame], onPage=self.draw_page))

    def beforeDocument(self):
        self.section_pages = []

    def draw_page(self, c, doc):
        c.saveState()
        if doc.page == 1:
            c.setFillColor(TEAL)
            c.roundRect(MARGIN, PAGE_H - 97, 36, 36, 9, stroke=0, fill=1)
            c.setFont('ManualSansBold', 20)
            c.setFillColor(colors.white)
            c.drawCentredString(MARGIN + 18, PAGE_H - 86, 'C')
            c.setFillColor(INK)
            c.setFont('ManualSansBold', 17)
            c.drawString(MARGIN + 48, PAGE_H - 76, 'CIMU')
            c.setFont('ManualSans', 7.5)
            c.setFillColor(MUTED)
            c.drawString(MARGIN + 49, PAGE_H - 91, 'E D I T O R I A L')
            c.setStrokeColor(TEAL)
            c.setLineWidth(3)
            c.line(MARGIN, 42, MARGIN + 80, 42)
        else:
            c.setFillColor(TEAL)
            c.setFont('ManualSansBold', 8.5)
            c.drawString(MARGIN, PAGE_H - 33, 'CIMU')
            c.setFillColor(MUTED)
            c.setFont('ManualSans', 7.2)
            c.drawString(MARGIN + 40, PAGE_H - 33, 'MANUAL DE ROLES Y PERMISOS')
            c.drawRightString(PAGE_W - MARGIN, PAGE_H - 33, 'V1.0  |  OCTUBRE 2026')
            c.setStrokeColor(LINE)
            c.setLineWidth(.6)
            c.line(MARGIN, PAGE_H - 44, PAGE_W - MARGIN, PAGE_H - 44)
            c.line(MARGIN, 42, PAGE_W - MARGIN, 42)
        c.setFillColor(MUTED)
        c.setFont('ManualSans', 7)
        c.drawString(MARGIN, 27, 'Guía para administración y equipo editorial')
        c.drawRightString(PAGE_W - MARGIN, 27, str(doc.page))
        c.restoreState()

    def afterFlowable(self, flowable):
        key = getattr(flowable, '_section_key', None)
        if key:
            title = flowable.getPlainText()
            self.canv.bookmarkPage(key)
            self.canv.addOutlineEntry(title, key, level=0, closed=False)
            self.notify('TOCEntry', (0, title, self.page, key))
            self.section_pages.append((title, self.page))


def table_widths(section, cols):
    if cols == 6:
        return [WIDTH - 5 * 53] + [53] * 5
    if cols == 2:
        return [150, WIDTH - 150]
    if cols == 3:
        return {
            '01': [102, 220, WIDTH - 322],
            '05': [113, 215, WIDTH - 328],
            '07': [103, 215, WIDTH - 318],
            '08': [115, 118, WIDTH - 233],
            '10': [130, 210, WIDTH - 340],
            '13': [145, 166, WIDTH - 311],
            '15': [101, 122, WIDTH - 223],
        }.get(section, [WIDTH / 3] * 3)
    return [WIDTH / cols] * cols


def make_table(lines, section, styles):
    rows = [[part.strip() for part in line.strip().strip('|').split('|')] for line in lines]
    rows = [row for row in rows if not all(re.fullmatch(r':?-+:?', cell.replace(' ', '')) for cell in row)]
    data = [[Paragraph(inline(cell), styles['th'] if r == 0 else styles['cell'])
             for cell in row] for r, row in enumerate(rows)]
    table = Table(data, colWidths=table_widths(section, len(rows[0])), repeatRows=1,
                  hAlign='LEFT', spaceBefore=4, spaceAfter=13)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), TEAL),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 7), ('RIGHTPADDING', (0, 0), (-1, -1), 7),
        ('TOPPADDING', (0, 0), (-1, -1), 6), ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F5F8F6')]),
        ('LINEBELOW', (0, 1), (-1, -1), .4, LINE),
    ]))
    if len(rows[0]) == 6:
        table.setStyle(TableStyle([
            ('LEFTPADDING', (1, 0), (-1, 0), 5),
            ('RIGHTPADDING', (1, 0), (-1, 0), 5),
        ]))
    return table


def parse_document(source, styles):
    lines = source.splitlines()
    story, section = [Spacer(1, 71)], ''
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if not line:
            i += 1
            continue
        if line == '<!-- index -->':
            story.extend([PageBreak(), Paragraph('Índice de consulta', styles['section']),
                          Paragraph('Selecciona una sección para ir directamente a ella en el PDF.', styles['body'])])
            toc = TableOfContents()
            toc.levelStyles = [styles['toc']]
            toc.dotsMinLevel = 0
            story.append(toc)
            i += 1
            continue
        if line == '<!-- page -->':
            story.append(PageBreak())
            i += 1
            continue
        if line == '<!-- workflow -->':
            story.append(Workflow(WIDTH))
            i += 1
            continue
        if line.startswith('# '):
            story.append(Paragraph('Manual de roles,<br/>permisos y<br/>flujo editorial', styles['cover']))
            i += 1
            continue
        if line.startswith('## '):
            text = line[3:]
            match = re.match(r'(\d{2})\.', text)
            if match:
                section = match[1]
                heading = Paragraph(inline(text), styles['section'])
                heading._section_key = 'section-' + section
            else:
                heading = Paragraph(inline(text), styles['sub'])
            story.append(heading)
            i += 1
            continue
        if line.startswith('### '):
            story.append(Paragraph(inline(line[4:]), styles['sub']))
            i += 1
            continue
        if line.startswith('|'):
            table_lines = []
            while i < len(lines) and lines[i].strip().startswith('|'):
                table_lines.append(lines[i])
                i += 1
            story.append(make_table(table_lines, section, styles))
            continue
        if line.startswith('> '):
            note_lines = []
            while i < len(lines) and lines[i].strip().startswith('> '):
                note_lines.append(lines[i].strip()[2:])
                i += 1
            note = Table([[Paragraph(inline(' '.join(note_lines)), styles['note'])]], colWidths=[WIDTH])
            note.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),PALE),('LINEBEFORE',(0,0),(0,-1),3,TEAL),
                                     ('LEFTPADDING',(0,0),(-1,-1),13),('RIGHTPADDING',(0,0),(-1,-1),12),
                                     ('TOPPADDING',(0,0),(-1,-1),11),('BOTTOMPADDING',(0,0),(-1,-1),11)]))
            story.extend([KeepTogether([note]), Spacer(1, 11)])
            continue
        if line.startswith('- '):
            story.append(Paragraph(inline(line[2:]), styles['bullet'], bulletText='-'))
            i += 1
            continue
        number = re.match(r'^(\d+)\.\s+(.*)', line)
        if number:
            story.append(Paragraph(f'<b>{number[1]}.</b> ' + inline(number[2]), styles['number']))
            i += 1
            continue
        para = [line]
        i += 1
        while i < len(lines) and lines[i].strip() and not re.match(r'^(#|\||>|- |\d+\. |<!--)', lines[i].strip()):
            para.append(lines[i].strip())
            i += 1
        story.append(Paragraph(inline(' '.join(para)), styles['body']))
    return story


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=ROOT / 'output/pdf/manual-roles-permisos-cimu.pdf')
    args = parser.parse_args()
    args.output.parent.mkdir(parents=True, exist_ok=True)
    register_fonts()
    doc = ManualDoc(args.output)
    doc.multiBuild(parse_document(SOURCE.read_text(encoding='utf-8'), make_styles()))
    print(f'PDF: {args.output}')
    print(f'Páginas: {doc.page}')
    for title, page in doc.section_pages:
        print(f'{page:02d}  {title}')


if __name__ == '__main__':
    main()
