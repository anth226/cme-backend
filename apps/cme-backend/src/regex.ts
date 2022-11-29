export function validateEmail(emailAdress) {
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(emailAdress)) {
    return true;
  } else {
    return false;
  }
}
