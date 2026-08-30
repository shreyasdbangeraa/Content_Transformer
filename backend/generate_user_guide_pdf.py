import os
import shutil
import pymupdf

def create_user_guide_pdf(output_path: str = "conteX_AI_User_Guide_and_Demonstration.pdf"):
    """
    Generates a simple, visual, beginner-friendly User Guide & Demonstration Manual PDF
    explaining step-by-step how to use the conteX AI website.
    """

    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
    <meta charset="utf-8">
    <style>
        @page {
            size: A4;
            margin: 28px 34px 28px 34px;
        }
        body {
            font-family: Helvetica, Arial, sans-serif;
            color: #1e293b;
            line-height: 1.45;
            font-size: 10pt;
            background-color: #ffffff;
            margin: 0;
            padding: 0;
        }
        h1, h2, h3, h4 {
            color: #0f172a;
            font-family: Helvetica, Arial, sans-serif;
            font-weight: bold;
            margin-top: 12pt;
            margin-bottom: 5pt;
        }
        h1 {
            font-size: 18pt;
            color: #0284c7;
            border-bottom: 2pt solid #0284c7;
            padding-bottom: 5pt;
            margin-top: 16pt;
            page-break-before: always;
        }
        h1.first-title {
            page-break-before: avoid;
            margin-top: 0;
        }
        h2 {
            font-size: 13pt;
            color: #0f172a;
            border-bottom: 1pt solid #e2e8f0;
            padding-bottom: 3pt;
            margin-top: 10pt;
        }
        h3 {
            font-size: 11pt;
            color: #0369a1;
            margin-top: 8pt;
            margin-bottom: 3pt;
        }
        p {
            margin-top: 3pt;
            margin-bottom: 5pt;
            text-align: justify;
        }
        strong {
            color: #0f172a;
            font-weight: bold;
        }
        .cover-header {
            background-color: #0f172a;
            color: #ffffff;
            padding: 20pt 24pt;
            border-radius: 10pt;
            margin-bottom: 14pt;
            text-align: center;
        }
        .cover-title {
            font-size: 22pt;
            font-weight: bold;
            color: #38bdf8;
            margin-bottom: 3pt;
        }
        .cover-subtitle {
            font-size: 11.5pt;
            color: #94a3b8;
            margin-bottom: 8pt;
        }
        .cover-badge {
            display: inline-block;
            background-color: #0284c7;
            color: #ffffff;
            font-size: 8.5pt;
            font-weight: bold;
            padding: 3pt 10pt;
            border-radius: 5pt;
            letter-spacing: 0.5pt;
        }
        .intro-box {
            background-color: #f0f9ff;
            border: 1.5pt solid #bae6fd;
            border-radius: 8pt;
            padding: 9pt 12pt;
            margin-bottom: 12pt;
        }
        .step-box {
            background-color: #f8fafc;
            border: 1pt solid #cbd5e1;
            border-radius: 8pt;
            padding: 10pt 12pt;
            margin-bottom: 10pt;
        }
        .step-badge {
            display: inline-block;
            background-color: #0284c7;
            color: #ffffff;
            font-weight: bold;
            font-size: 9pt;
            padding: 2pt 8pt;
            border-radius: 5pt;
            margin-bottom: 4pt;
        }
        .screen-box {
            background-color: #ffffff;
            border: 1pt dashed #0284c7;
            border-radius: 6pt;
            padding: 6pt 10pt;
            margin-top: 6pt;
            margin-bottom: 6pt;
        }
        .tip-box {
            background-color: #f0fdf4;
            border-left: 3.5pt solid #10b981;
            border-radius: 4pt;
            padding: 6pt 10pt;
            margin-top: 6pt;
            margin-bottom: 6pt;
            font-size: 9.5pt;
        }
        .action-box {
            background-color: #fffbeb;
            border-left: 3.5pt solid #f59e0b;
            border-radius: 4pt;
            padding: 6pt 10pt;
            margin-top: 6pt;
            margin-bottom: 6pt;
            font-size: 9.5pt;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 6pt;
            margin-bottom: 10pt;
            font-size: 9pt;
        }
        th {
            background-color: #0f172a;
            color: #ffffff;
            text-align: left;
            padding: 5pt 7pt;
            font-weight: bold;
        }
        td {
            border: 1pt solid #cbd5e1;
            padding: 4pt 7pt;
            vertical-align: top;
        }
        tr:nth-child(even) {
            background-color: #f8fafc;
        }
        ul, ol {
            margin-top: 2pt;
            margin-bottom: 6pt;
            padding-left: 16pt;
        }
        li {
            margin-bottom: 2.5pt;
        }
        code {
            font-family: monospace;
            background-color: #f1f5f9;
            color: #0369a1;
            padding: 1pt 3pt;
            border-radius: 3pt;
            font-size: 8.5pt;
            font-weight: bold;
        }
        .footer-note {
            font-size: 8pt;
            color: #64748b;
            text-align: center;
            margin-top: 16pt;
            border-top: 1pt solid #e2e8f0;
            padding-top: 6pt;
        }
    </style>
    </head>
    <body>

    <!-- COVER HEADER -->
    <div class="cover-header">
        <div class="cover-title">conteX AI</div>
        <div class="cover-subtitle">Complete Step-by-Step User Guide & Demonstration Manual</div>
        <div class="cover-badge">EASY 5-MINUTE GUIDE: HOW TO USE THE WEBSITE FROM START TO FINISH</div>
    </div>

    <div class="intro-box">
        <strong style="color: #0369a1; font-size: 11pt;">What is conteX AI? (In Plain Words)</strong><br>
        Imagine you have a 30-page PDF report, a research paper, or a company website. Usually, it takes hours to read it and write a PowerPoint presentation, a LinkedIn post, a Twitter thread, and an executive briefing.<br><br>
        <strong>conteX AI does all of this in under 30 seconds:</strong>
        <ol style="margin-bottom: 0;">
            <li>You upload your file (or paste a website link).</li>
            <li>The AI reads and verifies every fact with <strong>zero made-up information (no hallucinations)</strong>.</li>
            <li>It instantly generates ready-to-download <strong>PowerPoint Slides (.pptx)</strong>, <strong>Word Documents (.docx)</strong>, <strong>LinkedIn Posts</strong>, <strong>Twitter Threads</strong>, and <strong>Infographics</strong>.</li>
        </ol>
    </div>

    <!-- SECTION 1 -->
    <h1 class="first-title">Part 1: Quick Start Walkthrough (Step-by-Step)</h1>
    <p>
        Follow these simple steps on the website to transform your first document:
    </p>

    <!-- STEP 1 -->
    <div class="step-box">
        <div class="step-badge">STEP 1: Start a New Transformation</div>
        <h3>📥 Uploading Your Document or Entering a Website Link</h3>
        <p>
            On the left sidebar, click on <strong>"New Transformation"</strong> (or click the glowing blue button on your Dashboard).
        </p>
        
        <p><strong>You have 3 easy ways to provide your content:</strong></p>
        <ul>
            <li><strong>Option A (File Upload):</strong> Click or drag &amp; drop any <strong>PDF</strong>, <strong>Word (.docx)</strong>, or <strong>Text (.txt)</strong> file from your computer.</li>
            <li><strong>Option B (Web URL / Website):</strong> Paste any website link (e.g. <code>https://example.in</code> or a news article). 
                <br><em>*Bonus:</em> You can turn on <strong>"Deep Website Crawl"</strong> and it will automatically crawl internal pages like <code>/about</code>, <code>/services</code>, and <code>/pricing</code>!</li>
            <li><strong>Option C (Paste Text):</strong> Paste meeting notes, email drafts, or raw text directly into the text box.</li>
        </ul>

        <div class="screen-box">
            <strong>What you see on screen:</strong> You can enter a <strong>Project Name</strong> (e.g., <em>"Acme Q3 Review"</em>) and choose your <strong>Industry Domain</strong> (e.g., <em>Cybersecurity, Finance, Healthcare, Business</em>).
        </div>

        <div class="tip-box">
            <strong>💡 Pro Tip:</strong> If you don't have a file right now, the website has built-in <strong>Sample Incident Reports</strong> ready so you can test immediately with 1 click!
        </div>

        <p>Once your content is selected, click the blue button: <strong>"Proceed to Step 2: Research &amp; Fact-Checking"</strong>.</p>
    </div>

    <!-- STEP 2 -->
    <div class="step-box">
        <div class="step-badge">STEP 2: Automated Verification</div>
        <h3>🔍 Live Research &amp; Fact-Checking Radar</h3>
        <p>
            The system automatically scans your document through 4 verification stages:
        </p>
        <ol>
            <li><strong>Domain &amp; Purpose Extraction:</strong> Understands what your document is about and outlines its core purpose.</li>
            <li><strong>Evidence Cross-Checking:</strong> Matches extracted claims against high-authority sources (Government portals, academic papers, official industry standards).</li>
            <li><strong>Conflict &amp; Discrepancy Check:</strong> Verifies that there are no contradictions in numbers or dates.</li>
            <li><strong>Freshness &amp; PII Safety Scan:</strong> Checks document dates and automatically hides private IP addresses or personal phone numbers/emails.</li>
        </ol>

        <div class="screen-box">
            <strong>What you see on screen:</strong> A live 4-step progress animation with green checkmarks, followed by a neat summary showing total verified facts and key numbers.
        </div>

        <p>Click the green button: <strong>"Proceed to Step 3: Single-Truth Knowledge Base"</strong>.</p>
    </div>

    <!-- STEP 3 -->
    <div class="step-box">
        <div class="step-badge">STEP 3: Review Ground Truth</div>
        <h3>🎯 The Single Source of Truth (Canonical Knowledge)</h3>
        <p>
            Before generating posts or slides, the system shows you exactly what facts it extracted from your document so you are 100% in control.
        </p>

        <p><strong>Click across the tabs to explore:</strong></p>
        <ul>
            <li><strong>Key Facts Tab:</strong> Every single verified fact with its exact page number from your document.</li>
            <li><strong>Sensitive Data Radar:</strong> Shows any internal IP numbers or private emails that were automatically masked.</li>
            <li><strong>Risks &amp; Recommendations:</strong> High-priority action items and operational risks found in the document.</li>
            <li><strong>Summary Tab:</strong> A clean, executive summary narrative in bold typography.</li>
        </ul>

        <div class="action-box">
            <strong>Next Action:</strong> When you are satisfied with the verified facts, click <strong>"Proceed to Step 4: Configure Deliverables"</strong>.
        </div>
    </div>

    <!-- STEP 4 -->
    <h1>Part 2: Generating Your Deliverables &amp; Exports</h1>

    <div class="step-box">
        <div class="step-badge">STEP 4: Select Formats</div>
        <h3>🚀 Choose Which Deliverables You Want to Create</h3>
        <p>
            Select the checkboxes for what you want the AI to create for you. You can select all of them at once!
        </p>

        <table>
            <tr>
                <th>Deliverable</th>
                <th>What It Produces</th>
                <th>Best For</th>
            </tr>
            <tr>
                <td><strong>1. Executive Dossier</strong></td>
                <td>A 3-page high-level summary with key metrics and action plans.</td>
                <td>C-Suite, Executives &amp; Board Members</td>
            </tr>
            <tr>
                <td><strong>2. LinkedIn Thought Post</strong></td>
                <td>Engaging post with emojis, key takeaways, hashtags, and visual banner.</td>
                <td>LinkedIn Profile / Company Page</td>
            </tr>
            <tr>
                <td><strong>3. Slide Presentation Deck</strong></td>
                <td>Ready-to-present 16:9 slides with titles, bullet points, and speaker notes.</td>
                <td>Client Meetings &amp; Briefings (Downloadable as .PPTX)</td>
            </tr>
            <tr>
                <td><strong>4. Visual Infographic</strong></td>
                <td>High-resolution structured card with metrics and key pillars.</td>
                <td>Reports, Newsletters &amp; Visual Sharing</td>
            </tr>
            <tr>
                <td><strong>5. X / Twitter Thread</strong></td>
                <td>5 to 8 sequential tweets strictly under 280 characters each.</td>
                <td>Social Media Outreach &amp; Announcements</td>
            </tr>
            <tr>
                <td><strong>6. Security / Advisory Brief</strong></td>
                <td>Technical breakdown with CVSS scores, timeline, and mitigation steps.</td>
                <td>Technical Teams &amp; IT Engineers</td>
            </tr>
            <tr>
                <td><strong>7. Video Script Package</strong></td>
                <td>5-scene video storyboard with narration script and visual prompts.</td>
                <td>YouTube Shorts, Reels, or Video Production</td>
            </tr>
        </table>

        <p><strong>Customize Your Settings:</strong></p>
        <ul>
            <li><strong>Target Audience:</strong> Choose who will read it (e.g. <em>Executive Board, Regulators, Public, Engineers</em>).</li>
            <li><strong>Tone:</strong> Choose your tone (e.g. <em>Authoritative &amp; Strategic, Urgent, Inspiring, Technical</em>).</li>
            <li><strong>Language:</strong> English, Spanish, French, German, Japanese, etc.</li>
        </ul>

        <p>Click the big blue button: <strong>"Generate All Deliverables with AI"</strong>.</p>
    </div>

    <!-- STEP 5 & 6 -->
    <div class="step-box">
        <div class="step-badge">STEP 5 &amp; 6: Review &amp; Export</div>
        <h3>✨ Viewing, Editing, Downloading &amp; Publishing</h3>
        <p>
            In seconds, your outputs are generated! You will see tabs for each deliverable:
        </p>

        <ul>
            <li><strong>Interactive Slide Deck Viewer:</strong> Click "Next Slide" to preview your presentation slides on screen. Click <strong>"Download .PPTX"</strong> to open it directly in Microsoft PowerPoint!</li>
            <li><strong>LinkedIn Post Card:</strong> Preview your LinkedIn post with emojis and hero image. Click <strong>"Post to LinkedIn"</strong> to automatically copy the text and open LinkedIn!</li>
            <li><strong>Executive Summary &amp; Advisory:</strong> Read the formatted report. Click <strong>"Export Document"</strong> to download a formatted Word document (<strong>.docx</strong>).</li>
            <li><strong>100% Fact-Check Score:</strong> Scroll down to see the Fact-Checking Radar proving that 100% of claims are grounded in your original document.</li>
        </ul>

        <div class="tip-box">
            <strong>✏️ How to Edit with AI:</strong> Want to change something? Click the <strong>"Refine with AI"</strong> button on any deliverable, type what you want (e.g. <em>"Make this sound more urgent"</em> or <em>"Add more emphasis on the cost savings"</em>), and the AI will rewrite it instantly while keeping all facts 100% accurate!
        </div>
    </div>

    <!-- PART 3: ADVANCED FEATURES -->
    <h1>Part 3: Key Features &amp; Settings Explained Simply</h1>

    <div class="step-box">
        <h3>🔒 1. 100% Offline Local AI (Ollama) — Zero Cloud Leakage</h3>
        <p>
            If you work with confidential documents, defense reports, or sensitive financial data, you don't have to send any data to cloud services like OpenAI or Google Gemini.
        </p>
        <ul>
            <li>Go to <strong>Settings</strong> on the left sidebar.</li>
            <li>Select <strong>"Local LLM (Ollama - Llama 3)"</strong>.</li>
            <li>The system will run 100% on your own computer CPU/GPU. No text or data ever leaves your device!</li>
        </ul>
    </div>

    <div class="step-box">
        <h3>🌐 2. Deep Website Crawling (Root + Subpages)</h3>
        <p>
            When you enter a website link like <code>https://example.in</code> in the URL tab:
        </p>
        <ul>
            <li>Toggle ON <strong>"Deep Website Crawl"</strong>.</li>
            <li>Select the number of pages (e.g., 4, 8, 12, 16 pages).</li>
            <li>conteX AI will automatically find and read <code>/about</code>, <code>/services</code>, <code>/pricing</code>, <code>/team</code>, and <code>/docs</code>, combining the whole website into one easy project!</li>
        </ul>
    </div>

    <div class="step-box">
        <h3>📚 3. Organizational Knowledge Base (RAG)</h3>
        <p>
            Want the AI to remember your company's brand voice, safety rules, or corporate tone for every future project?
        </p>
        <ul>
            <li>Click <strong>"Knowledge Base"</strong> on the left sidebar.</li>
            <li>Click <strong>"Add Document"</strong> and upload your brand guide, compliance rules, or communication policies.</li>
            <li>conteX AI converts them into vector search memories and automatically applies them every time you generate a slide deck or post!</li>
        </ul>
    </div>

    <div class="step-box">
        <h3>⛓️ 4. Blockchain Content Integrity &amp; Proof of Authenticity</h3>
        <p>
            How do you prove that an executive report was not tampered with or edited maliciously?
        </p>
        <ul>
            <li>conteX AI creates a unique <strong>SHA-256 digital fingerprint (hash)</strong> for every version of your document.</li>
            <li>Every edit is timestamped and anchored on the blockchain audit ledger, creating tamper-proof proof of authenticity.</li>
        </ul>
    </div>

    <div class="step-box">
        <h3>⚡ 5. 1-Click Multi-Format Exports</h3>
        <p>
            Every project can be downloaded immediately in your favorite formats:
        </p>
        <ul>
            <li>📊 <strong>PowerPoint (.pptx):</strong> Fully styled 16:9 widescreen slides with bullet points and speaker notes.</li>
            <li>📝 <strong>Microsoft Word (.docx):</strong> Professional reports with bold headings, callout boxes, and tables.</li>
            <li>📄 <strong>Markdown / Text (.txt / .md):</strong> Raw clean text for blogs or internal wikis.</li>
            <li>🔗 <strong>n8n &amp; Webhooks:</strong> Automatically push generated posts to Slack, Discord, or automated publishing pipelines.</li>
        </ul>
    </div>

    <!-- SUMMARY RECAP -->
    <div class="cover-header" style="margin-top: 14pt;">
        <div class="cover-title" style="font-size: 16pt;">You're Ready to Go!</div>
        <div class="cover-subtitle" style="font-size: 10pt;">Open the dashboard, click "New Transformation", and turn your first document into world-class deliverables in 30 seconds.</div>
    </div>

    <div class="footer-note">
        conteX AI • Official Simple Demonstration &amp; User Manual • 100% Source-Grounded Intelligence Platform
    </div>

    </body>
    </html>
    """

    doc = pymupdf.open()
    story = pymupdf.Story(html=html_content)
    writer = pymupdf.DocumentWriter(output_path)
    
    # A4 dimensions: 595 x 842 points
    page_rect = pymupdf.Rect(0, 0, 595, 842)
    content_rect = pymupdf.Rect(30, 30, 565, 812)
    
    more = 1
    page_count = 0
    while more:
        page_count += 1
        device = writer.begin_page(page_rect)
        more, _ = story.place(content_rect)
        story.draw(device)
        writer.end_page()
        
    writer.close()
    print(f"Simple User Guide PDF generated successfully at: {output_path} ({page_count} pages)")
    return output_path

if __name__ == "__main__":
    out_dir = os.path.abspath("exports")
    os.makedirs(out_dir, exist_ok=True)
    
    # Generate in exports dir
    out_file = os.path.join(out_dir, "conteX_AI_User_Guide_and_Demonstration.pdf")
    create_user_guide_pdf(out_file)
    
    # Generate in workspace root
    root_file = os.path.abspath("conteX_AI_User_Guide_and_Demonstration.pdf")
    create_user_guide_pdf(root_file)
    
    # Also overwrite the previous main PDF so either filename works
    legacy_file = os.path.abspath("conteX_AI_Complete_Project_Documentation.pdf")
    create_user_guide_pdf(legacy_file)
