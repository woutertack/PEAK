<Button
status="danger"
text="Logout"
onPress={async () => {
  const { error } = await supabase.auth.signOut();
  if (!error) {
    alert("Signed out!");
  }
  if (error) {
    alert(error.message);
  }
}}
style={{
  marginTop: 10,
}}
/>