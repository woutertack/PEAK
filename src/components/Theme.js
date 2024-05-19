rightContent={
  <Ionicons
    name={isDarkmode ? "sunny" : "moon"}
    size={20}
    color={isDarkmode ? themeColor.white100 : themeColor.dark}
  />
}
rightAction={() => {
  if (isDarkmode) {
    setTheme("light");
  } else {
    setTheme("dark");
  }
}}
/>