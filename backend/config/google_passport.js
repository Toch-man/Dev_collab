const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (access_token, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
          user = await User.create({
            full_name: profile.displayName,
            username: profile.displayName.replace(/\s+/g, "_").toLowerCase(),
            email: profile.emails[0].value,
            password: "google_oauth", // placeholder — google users never use this
            niche: "Web development", // default — user updates this on dashboard
            bio: "",
            skills: [],
            refreshToken: null,
          });
        }
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport;
