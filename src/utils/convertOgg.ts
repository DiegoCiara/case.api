import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const writeFileAsync = promisify(fs.writeFile);
const readFileAsync = promisify(fs.readFile);
const unlinkAsync = promisify(fs.unlink);
const mkdirAsync = promisify(fs.mkdir);

export async function convertWebmToOgg(base64Webm: string): Promise<string> {
  const webmPath = 'uploads/audio.webm';
  const oggPath = 'uploads/temp.ogg';

  try {
    // Criar o diretório "uploads" se não existir
    if (!fs.existsSync('uploads')) {
      await mkdirAsync('uploads');
    }

    // Decodificar Base64 e salvar como arquivo .webm
    const buffer = Buffer.from(base64Webm, 'base64');
    await writeFileAsync(webmPath, buffer);

    // Verificar se o arquivo foi salvo corretamente
    if (!fs.existsSync(webmPath)) {
      throw new Error(`O arquivo ${webmPath} não foi salvo corretamente.`);
    }

    const stats = fs.statSync(webmPath);
    if (stats.size === 0) {
      throw new Error(`O arquivo ${webmPath} está vazio.`);
    }

    console.log(`Arquivo salvo em ${webmPath}, tamanho: ${stats.size} bytes`);

    // Usar ffmpeg diretamente para converter para OGG

    const validateWebm = async () => {
      try {
        const { stderr } = await execAsync(`ffprobe -i ${webmPath} -show_format -show_streams`);
        if (stderr.includes("Invalid data")) {
          throw new Error("Arquivo WebM inválido.");
        }
      } catch (error) {
        console.error("Erro ao validar WebM:", error);
        throw new Error("Arquivo WebM inválido ou corrompido.");
      }
    };

    await validateWebm();
    const command = `ffmpeg -i ${webmPath} -acodec libvorbis ${oggPath}`;
    await execAsync(command);

    // Verificar se o arquivo OGG foi criado
    if (!fs.existsSync(oggPath)) {
      throw new Error(`O arquivo ${oggPath} não foi criado.`);
    }

    console.log(`Arquivo OGG criado em ${oggPath}`);

    // Ler o arquivo .ogg e converter para Base64
    const oggBuffer = await readFileAsync(oggPath);
    const base64Ogg = oggBuffer.toString('base64');

    // Limpar arquivos temporários
    await unlinkAsync(webmPath);
    await unlinkAsync(oggPath);

    return base64Ogg;
  } catch (error) {
    console.error('Erro ao converter WebM para OGG:', error);
    throw new Error('Falha na conversão de WebM para OGG');
  }
}