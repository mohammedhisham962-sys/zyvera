with open("src/js/app_react.js", "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace("@aigra.internal", "@zyvera.internal")
text = text.replace("@cadet.aigra.internal", "@cadet.zyvera.internal")
text = text.replace("@aigra.edu", "@zyvera.edu")
text = text.replace("aigr44dmin4123", "zyver44dmin4123")

with open("src/js/app_react.js", "w", encoding="utf-8") as f:
    f.write(text)

print("Email & demo credentials cleaned to ZYVERA.")
