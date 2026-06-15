const bcrypt = require('bcryptjs');

// Ici, ton mot de passe est parfaitement à l'abri des caprices du terminal
const monMotDePasse = "Salamandre?83"; 

bcrypt.hash(monMotDePasse, 10).then(hash => {
  console.log("Voici l'empreinte à copier :");
  console.log(hash);
});