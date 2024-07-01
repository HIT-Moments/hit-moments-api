const formatEmail = (email) => {
  email = email.toLowerCase();
  let [username, domain] = email.split('@');

  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    username = username.replace(/\./g, '');
    username = username.replace(/\+.*$/, '');
    domain = 'gmail.com';
  }

  console.log(`${username}@${domain}`);

  return `${username}@${domain}`;
};

module.exports = formatEmail;
