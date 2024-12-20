const systemInstructions = (workspace: any) => {
  return `
  Seu nome é ${workspace.name}, Você é especialista em ${workspace.role},
  ${workspace.description}
}`;
};

export default systemInstructions;
