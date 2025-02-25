export default async (ctx) => {
  if (!ctx.state.user) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Authentication required" };
    return;
  }
  return true;
  };
  