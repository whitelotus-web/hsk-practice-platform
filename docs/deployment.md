# Huong dan trien khai

## Lua chon hosting hien tai

Dung GitHub Pages cho ban web hien tai.

- App dang chay la HTML, CSS va JavaScript tinh trong `static-app/`.
- GitHub Pages co the publish truc tiep tu repository bang GitHub Actions.
- Moi lan push len `main`, workflow se deploy lai ban moi nhat trong `static-app/`.
- URL cong khai du kien la:

```text
https://whitelotus-web.github.io/hsk-practice-platform/
```

## Cau hinh GitHub Pages lan dau

Tren GitHub:

1. Mo repo `whitelotus-web/hsk-practice-platform`.
2. Vao `Settings` -> `Pages`.
3. Trong `Build and deployment`, dat `Source` thanh `GitHub Actions`.
4. Vao tab `Actions` va doi workflow `Deploy static app to GitHub Pages` chay xong.

File workflow la `.github/workflows/pages.yml`.

## Quy trinh cap nhat hang ngay

Tu thu muc du an nay:

```powershell
git status
git add .
git commit -m "Describe the update"
git push origin main
```

Sau khi push, GitHub Actions se deploy tu dong. Xem GitHub la nguon dong bo
chinh: may local sua code, GitHub luu lich su, GitHub Pages cap nhat web cong
khai.

## Xem thu tren may

Truoc khi push, xem truoc dung ban static app:

```powershell
node scripts/serve-static.mjs static-app 4173
```

Sau do mo:

```text
http://localhost:4173/
```

## Gioi han va buoc hosting tiep theo

GitHub Pages phu hop mien phi khi san pham con la static/PWA learning site. No
khong phai backend host. Khi nen tang can dang nhap that, thanh toan, giao vien
duyet bai, database ngan hang cau hoi, upload file, cham diem AI va analytics,
giu GitHub Pages cho frontend hoac chuyen frontend sang Vercel/Netlify, roi them
backend/database nhu Supabase/PostgreSQL va API hosting.

Khong dua secret, noi dung tra phi, du lieu hoc vien rieng tu hoac production
key vao repo static. Moi thu trong `static-app/` se thanh public sau khi deploy.
