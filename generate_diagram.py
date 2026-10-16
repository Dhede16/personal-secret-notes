import matplotlib.pyplot as plt
import matplotlib.patches as patches
from PIL import Image

def create_architecture_diagram():
    # 2200 x 1500 canvas for maximum breathing room and crisp alignment
    fig, ax = plt.subplots(figsize=(22, 15), dpi=150)
    ax.set_xlim(0, 2200)
    ax.set_ylim(0, 1500)
    ax.axis('off')
    fig.patch.set_facecolor('#ffffff')

    font_main = 'DejaVu Sans'
    COLOR_BOX_BG = '#ffffff'
    COLOR_BOX_BORDER = '#0f172a'
    COLOR_TEXT = '#0f172a'
    COLOR_MUTED = '#475569'
    COLOR_CYLINDER_BG = '#f8fafc'
    COLOR_ARROW = '#0f172a'

    def draw_box(x, y, w, h, is_dashed=False, bg_color=COLOR_BOX_BG, border_color=COLOR_BOX_BORDER, radius=8):
        style = f"round,pad=0.25,rounding_size={radius}"
        linestyle = (0, (4, 3)) if is_dashed else '-'
        rect = patches.FancyBboxPatch(
            (x - w/2, y - h/2), w, h,
            boxstyle=style,
            linewidth=1.6,
            edgecolor=border_color,
            facecolor=bg_color,
            linestyle=linestyle,
            zorder=2
        )
        ax.add_patch(rect)

    def draw_cylinder(x, y, w, h, title_top, subtitle, items):
        r = w / 2
        cap_h = 32
        body_h = h - cap_h
        
        # Bottom curve
        bottom_cap = patches.Arc((x, y - h/2 + cap_h/2), w, cap_h, angle=0, theta1=180, theta2=360, 
                                 edgecolor=COLOR_BOX_BORDER, linewidth=1.6, zorder=2)
        ax.add_patch(bottom_cap)
        
        # Side lines
        ax.plot([x - r, x - r], [y - h/2 + cap_h/2, y + h/2 - cap_h/2], color=COLOR_BOX_BORDER, linewidth=1.6, zorder=2)
        ax.plot([x + r, x + r], [y - h/2 + cap_h/2, y + h/2 - cap_h/2], color=COLOR_BOX_BORDER, linewidth=1.6, zorder=2)
        
        # Body background
        body_rect = patches.Rectangle((x - r, y - h/2 + cap_h/2), w, body_h, facecolor=COLOR_CYLINDER_BG, edgecolor='none', zorder=1)
        ax.add_patch(body_rect)
        
        # Top ellipse
        top_cap = patches.Ellipse((x, y + h/2 - cap_h/2), w, cap_h, facecolor='#f1f5f9', edgecolor=COLOR_BOX_BORDER, linewidth=1.6, zorder=3)
        ax.add_patch(top_cap)
        
        # Inner dashed card
        inner_w = w - 36
        inner_h = h - cap_h - 75
        schema_box = patches.FancyBboxPatch(
            (x - inner_w/2, y - h/2 + 20), inner_w, inner_h,
            boxstyle="round,pad=0.2,rounding_size=6",
            linewidth=1.2,
            edgecolor='#94a3b8',
            facecolor='#ffffff',
            linestyle=(0, (3, 3)),
            zorder=4
        )
        ax.add_patch(schema_box)
        
        # Title text
        ax.text(x, y + h/2 - 46, title_top, ha='center', va='center', fontsize=12.5, fontweight='bold', color=COLOR_TEXT, zorder=5, fontfamily=font_main)
        ax.text(x, y + h/2 - 68, subtitle, ha='center', va='center', fontsize=9.5, fontweight='bold', color=COLOR_MUTED, zorder=5, fontfamily=font_main)
        
        item_text = "\n".join([f"•  {item}" for item in items])
        ax.text(x - inner_w/2 + 20, y - 42, item_text, ha='left', va='center', fontsize=10.5, color='#1e293b', linespacing=1.6, zorder=5, fontfamily=font_main)

    def draw_arrow(x1, y1, x2, y2, is_dashed=False):
        linestyle = (0, (4, 3)) if is_dashed else '-'
        ax.annotate(
            '', xy=(x2, y2), xytext=(x1, y1),
            arrowprops=dict(
                arrowstyle="->,head_width=0.35,head_length=0.55",
                lw=1.5,
                color=COLOR_ARROW,
                linestyle=linestyle
            ),
            zorder=3
        )

    # -------------------------------------------------------------
    # 1. HEADER TITLE
    # -------------------------------------------------------------
    ax.text(1100, 1435, "Arsitektur Sistem", ha='center', va='center', fontsize=24, fontweight='bold', color='#0f172a', fontfamily=font_main)
    ax.text(1100, 1395, "Secure Notes (Zero-Knowledge Client-Side AES-256-GCM)", ha='center', va='center', fontsize=15.5, fontweight='bold', color='#334155', fontfamily=font_main)

    # User Header Indicators
    ax.text(500, 1430, "User (Browser)", ha='center', va='center', fontsize=15, fontweight='bold', color='#0f172a', fontfamily=font_main)
    ax.text(1700, 1430, "User (Browser)", ha='center', va='center', fontsize=15, fontweight='bold', color='#0f172a', fontfamily=font_main)

    # -------------------------------------------------------------
    # 2. LEFT FLOW (ENCRYPTION / CREATE & UPDATE)
    # -------------------------------------------------------------
    col_left_x = 500
    
    # Step 1: Input Note
    draw_box(col_left_x, 1290, 270, 70, radius=8)
    ax.text(col_left_x, 1290, "Buat / Edit Catatan\n(Input Plaintext)", ha='center', va='center', fontsize=11, fontweight='bold', color=COLOR_TEXT, linespacing=1.35, zorder=4, fontfamily=font_main)

    # Step 2: Encryption
    draw_box(col_left_x, 1120, 270, 75, radius=8)
    ax.text(col_left_x, 1120, "Enkripsi Catatan\n(Web Crypto AES-256-GCM)", ha='center', va='center', fontsize=11, fontweight='bold', color=COLOR_TEXT, linespacing=1.35, zorder=4, fontfamily=font_main)

    # Support Box (Far Left)
    sup_l_w, sup_l_h = 265, 180
    sup_l_x, sup_l_y = 190, 1120
    draw_box(sup_l_x, sup_l_y, sup_l_w, sup_l_h, is_dashed=True, radius=8)
    ax.text(sup_l_x, sup_l_y + sup_l_h/2 - 24, "Fitur Visualizer & Parameter", ha='center', va='center', fontsize=10.5, fontweight='bold', color=COLOR_TEXT, zorder=4, fontfamily=font_main)
    sup_l_text = "• Log Matriks Hexadecimal\n  (Blok State 4x4)\n• Visualisasi Round Keys\n  (Key Expansion 14 Putaran)\n• Parameter AES-256-GCM:\n  Key 256-bit, IV 12-byte CSPRNG,\n  GMAC Auth Tag 16-byte"
    ax.text(sup_l_x - sup_l_w/2 + 18, sup_l_y - 15, sup_l_text, ha='left', va='center', fontsize=9.5, color=COLOR_TEXT, linespacing=1.4, zorder=4, fontfamily=font_main)

    # Step 3: Ciphertext
    draw_box(col_left_x, 950, 270, 70, radius=8)
    ax.text(col_left_x, 950, "Data Terenkripsi\n(Ciphertext + 16-Byte GMAC Tag)", ha='center', va='center', fontsize=10.5, fontweight='bold', color=COLOR_TEXT, linespacing=1.35, zorder=4, fontfamily=font_main)

    # Step 4: Send to Backend
    draw_box(col_left_x, 780, 270, 70, radius=8)
    ax.text(col_left_x, 780, "Simpan ke Database\n(POST / PUT /api/notes)", ha='center', va='center', fontsize=11, fontweight='bold', color=COLOR_TEXT, linespacing=1.35, zorder=4, fontfamily=font_main)

    # Left Column Arrows
    draw_arrow(col_left_x, 1255, col_left_x, 1158)
    draw_arrow(col_left_x, 1082, col_left_x, 985)
    draw_arrow(col_left_x, 915, col_left_x, 815)
    draw_arrow(col_left_x + 135, 780, 935, 780) # to database
    # Dashed to visualizer
    draw_arrow(col_left_x - 135, 1120, sup_l_x + sup_l_w/2, 1120, is_dashed=True)

    # -------------------------------------------------------------
    # 3. CENTER TOP (KEY DERIVATION)
    # -------------------------------------------------------------
    kdf_x = 1100
    kdf_y = 1205
    kdf_w, kdf_h = 300, 220
    draw_box(kdf_x, kdf_y, kdf_w, kdf_h, is_dashed=True, radius=8)
    ax.text(kdf_x, kdf_y + kdf_h/2 - 24, "Key Derivation (KDF)", ha='center', va='center', fontsize=12, fontweight='bold', color=COLOR_TEXT, zorder=4, fontfamily=font_main)
    
    ax.text(kdf_x, kdf_y + 45, "Passphrase / Kata Sandi", ha='center', va='center', fontsize=10.5, color=COLOR_TEXT, zorder=4, fontfamily=font_main)
    draw_arrow(kdf_x, kdf_y + 30, kdf_x, kdf_y + 5)
    
    ax.text(kdf_x, kdf_y - 10, "KDF (SHA-256 Hash Digest)", ha='center', va='center', fontsize=10.5, color=COLOR_TEXT, zorder=4, fontfamily=font_main)
    draw_arrow(kdf_x, kdf_y - 25, kdf_x, kdf_y - 50)
    
    ax.text(kdf_x, kdf_y - 68, "Kunci Simetris AES 256-bit\n(AES-GCM CryptoKey)", ha='center', va='center', fontsize=10, fontweight='bold', color=COLOR_TEXT, linespacing=1.3, zorder=4, fontfamily=font_main)

    # Dashed arrow from KDF to Encryption
    draw_arrow(kdf_x - kdf_w/2, 1120, col_left_x + 135, 1120, is_dashed=True)

    # -------------------------------------------------------------
    # 4. CENTER MIDDLE (DATABASE - NOTES.JSON)
    # -------------------------------------------------------------
    db_x = 1100
    db_y = 780
    db_w, db_h = 290, 330
    draw_cylinder(db_x, db_y, db_w, db_h, "DATABASE (Notes)", "backend/data/notes.json", [
        "id  (UUID)",
        "title  (Plaintext)",
        "ciphertext  (Base64 + Tag)",
        "iv  (Base64 12-byte)",
        "created_at  (ISO 8601)",
        "updated_at  (ISO 8601)"
    ])

    # -------------------------------------------------------------
    # 5. CENTER BOTTOM (IN-MEMORY SESSION & INSTANT LOCK)
    # -------------------------------------------------------------
    session_y = 540
    lock_y = 425
    mem_w, mem_h = 320, 68
    lock_h = 76
    
    draw_box(db_x, session_y, mem_w, mem_h, is_dashed=True, radius=6)
    ax.text(db_x, session_y, "Sesi In-Memory (RAM Browser)\n(Kunci tidak disimpan di disk)", ha='center', va='center', fontsize=10.5, fontweight='bold', color=COLOR_TEXT, linespacing=1.35, zorder=4, fontfamily=font_main)

    draw_box(db_x, lock_y, mem_w, lock_h, is_dashed=True, radius=6)
    ax.text(db_x, lock_y, "Instant Lock / Timeout\n(Bersihkan Kunci & Plaintext dari RAM)", ha='center', va='center', fontsize=10, fontweight='bold', color=COLOR_TEXT, linespacing=1.4, zorder=4, fontfamily=font_main)

    draw_arrow(db_x, db_y - db_h/2, db_x, session_y + mem_h/2, is_dashed=True) # from DB to Session
    draw_arrow(db_x, session_y - mem_h/2, db_x, lock_y + lock_h/2, is_dashed=True)

    # -------------------------------------------------------------
    # 6. RIGHT FLOW (DECRYPTION / READ & VIEW)
    # -------------------------------------------------------------
    col_right_x = 1700
    
    # Step 1: Select Note
    draw_box(col_right_x, 1290, 270, 70, radius=8)
    ax.text(col_right_x, 1290, "Pilih Catatan\n(Daftar Catatan)", ha='center', va='center', fontsize=11, fontweight='bold', color=COLOR_TEXT, linespacing=1.35, zorder=4, fontfamily=font_main)

    # Step 2: Fetch Encrypted
    draw_box(col_right_x, 1120, 270, 75, radius=8)
    ax.text(col_right_x, 1120, "Ambil Data Terenkripsi\n(GET /api/notes)", ha='center', va='center', fontsize=11, fontweight='bold', color=COLOR_TEXT, linespacing=1.35, zorder=4, fontfamily=font_main)

    # Step 3: Ciphertext & IV in Client
    draw_box(col_right_x, 950, 270, 70, radius=8)
    ax.text(col_right_x, 950, "Data Terenkripsi (Ciphertext)\n& Initialization Vector (IV)", ha='center', va='center', fontsize=10.5, fontweight='bold', color=COLOR_TEXT, linespacing=1.35, zorder=4, fontfamily=font_main)

    # Step 4: Decryption
    draw_box(col_right_x, 780, 270, 75, radius=8)
    ax.text(col_right_x, 780, "Dekripsi Catatan\n(Web Crypto AES-256-GCM)", ha='center', va='center', fontsize=11, fontweight='bold', color=COLOR_TEXT, linespacing=1.35, zorder=4, fontfamily=font_main)

    # Support Box (Far Right)
    sup_r_w, sup_r_h = 265, 180
    sup_r_x, sup_r_y = 2010, 780
    draw_box(sup_r_x, sup_r_y, sup_r_w, sup_r_h, is_dashed=True, radius=8)
    ax.text(sup_r_x, sup_r_y + sup_r_h/2 - 24, "Verifikasi & Keamanan", ha='center', va='center', fontsize=10.5, fontweight='bold', color=COLOR_TEXT, zorder=4, fontfamily=font_main)
    sup_r_text = "• Verifikasi Integritas GMAC Tag\n• Scrambled Text (Glitch Effect)\n  jika kunci salah / tag corrupt\n• Dekripsi murni di RAM Browser\n  (Zero-Knowledge)"
    ax.text(sup_r_x - sup_r_w/2 + 18, sup_r_y - 15, sup_r_text, ha='left', va='center', fontsize=9.5, color=COLOR_TEXT, linespacing=1.4, zorder=4, fontfamily=font_main)

    # Step 5: Plaintext
    draw_box(col_right_x, 610, 270, 70, radius=8)
    ax.text(col_right_x, 610, "Catatan Asli\n(Plaintext Display)", ha='center', va='center', fontsize=11, fontweight='bold', color=COLOR_TEXT, linespacing=1.35, zorder=4, fontfamily=font_main)

    # Right Column Arrows
    draw_arrow(col_right_x, 1255, col_right_x, 1158)
    draw_arrow(col_right_x, 1082, col_right_x, 985)
    draw_arrow(col_right_x, 915, col_right_x, 818)
    draw_arrow(col_right_x, 742, col_right_x, 645)

    # Clean stepped routing for DB -> Fetch
    ax.plot([db_x + db_w/2, 1370, 1370, col_right_x - 135], [890, 890, 1120, 1120], color=COLOR_ARROW, lw=1.5, zorder=3)
    ax.annotate('', xy=(col_right_x - 135, 1120), xytext=(col_right_x - 145, 1120),
                arrowprops=dict(arrowstyle="->,head_width=0.35,head_length=0.55", lw=1.5, color=COLOR_ARROW), zorder=3)

    # Clean stepped routing for KDF -> Decryption
    ax.plot([kdf_x + kdf_w/2, 1470, 1470, col_right_x - 135], [1120, 1120, 780, 780], color=COLOR_ARROW, lw=1.5, linestyle=(0, (4, 3)), zorder=3)
    ax.annotate('', xy=(col_right_x - 135, 780), xytext=(col_right_x - 145, 780),
                arrowprops=dict(arrowstyle="->,head_width=0.35,head_length=0.55", lw=1.5, color=COLOR_ARROW, linestyle=(0, (4, 3))), zorder=3)

    # Dashed to support box
    draw_arrow(col_right_x + 135, 780, sup_r_x - sup_r_w/2, 780, is_dashed=True)

    # -------------------------------------------------------------
    # 7. BOTTOM SUMMARY BOXES
    # -------------------------------------------------------------
    bottom_box_w = 580
    bottom_box_h = 265
    bottom_box_y = 165

    # Bottom Left Box (Fitur Utama)
    b_l_x = 510
    draw_box(b_l_x, bottom_box_y, bottom_box_w, bottom_box_h, is_dashed=True, radius=8)
    ax.text(b_l_x, bottom_box_y + bottom_box_h/2 - 25, "Fitur Utama Sistem", ha='center', va='center', fontsize=12, fontweight='bold', color=COLOR_TEXT, zorder=4, fontfamily=font_main)
    b_l_text = (
        "• Zero-Knowledge Client-Side Architecture (Enkripsi di Browser)\n"
        "• Membuat, membaca, mengedit & menghapus catatan (Full CRUD)\n"
        "• Enkripsi & Dekripsi AES-256-GCM via native Web Crypto API\n"
        "• Key Derivation menggunakan SHA-256 dari Passphrase Pengguna\n"
        "• Pembangkitan IV acak 12-byte unik via CSPRNG setiap kali simpan\n"
        "• Verifikasi integritas & otentisitas data via 16-byte GMAC Tag\n"
        "• Log visualisasi matriks hex State (4x4) & Byte Inspector\n"
        "• Visualisasi Key Expansion (14 Rounds Subkunci AES-256)\n"
        "• In-Memory Key Lifecycle & Fitur Instant Lock (Hapus RAM)"
    )
    ax.text(b_l_x - bottom_box_w/2 + 20, bottom_box_y - 16, b_l_text, ha='left', va='center', fontsize=9.8, color=COLOR_TEXT, linespacing=1.38, zorder=4, fontfamily=font_main)

    # Bottom Right Box (Keterangan Teknis)
    b_r_x = 1690
    draw_box(b_r_x, bottom_box_y, bottom_box_w, bottom_box_h, is_dashed=True, radius=8)
    ax.text(b_r_x, bottom_box_y + bottom_box_h/2 - 25, "Keterangan & Spesifikasi Teknis", ha='center', va='center', fontsize=12, fontweight='bold', color=COLOR_TEXT, zorder=4, fontfamily=font_main)
    b_r_text = (
        "• AES-256-GCM : Advanced Encryption Standard - Galois/Counter Mode\n"
        "• KDF : Key Derivation Function (SHA-256 Hash Digest)\n"
        "• CSPRNG : Cryptographically Secure Pseudo-Random Number Generator\n"
        "• IV : Initialization Vector (12-byte / 96-bit unik per catatan)\n"
        "• GMAC Tag : Galois Message Authentication Code 128-bit (Integritas)\n"
        "• Zero-Knowledge : Server/FastAPI tidak pernah tahu isi catatan / kunci\n"
        "• Storage : Penyimpanan file JSON atomik (backend/data/notes.json)\n"
        "• Non-Persistent Keys : Kunci tidak disimpan di disk / localStorage\n"
        "• Glitch Simulation : Teks teracak deterministik saat sandi salah"
    )
    ax.text(b_r_x - bottom_box_w/2 + 20, bottom_box_y - 16, b_r_text, ha='left', va='center', fontsize=9.8, color=COLOR_TEXT, linespacing=1.38, zorder=4, fontfamily=font_main)

    # Arrows to summary boxes
    draw_arrow(db_x - mem_w/2, lock_y, b_l_x + bottom_box_w/2 - 50, bottom_box_y + bottom_box_h/2, is_dashed=True)
    draw_arrow(db_x + mem_w/2, lock_y, b_r_x - bottom_box_w/2 + 50, bottom_box_y + bottom_box_h/2, is_dashed=True)

    plt.tight_layout()
    output_png = 'arsitektur-sistem-revisi.png'
    output_jpg = 'arsitektur-sistem-revisi.jpeg'
    plt.savefig(output_png, dpi=200, bbox_inches='tight', facecolor='#ffffff')
    
    # Save as high quality JPEG too
    img = Image.open(output_png).convert('RGB')
    img.save(output_jpg, 'JPEG', quality=95)
    print("Successfully finalized:", output_png, "and", output_jpg)

if __name__ == '__main__':
    create_architecture_diagram()
