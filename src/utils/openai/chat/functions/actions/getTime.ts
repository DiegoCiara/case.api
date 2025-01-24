
import Log from "@entities/Log";



export async function getTime(): Promise<{ status: string; message: string; object: any | null }>{
  console.log('Entrou na action: getTime')
  try {

    const date = new Date()

    return {
      status: 'completed',
      message: `A data de hoje é ${date}`,
      object: date
    }

  } catch (error) {
    // await createAction(call)
    console.error(error)

    await Log.create({
      table: 'actions',
      operation: 'runAction:getTime',
      // user,
      status: 'failed',
      data: JSON.stringify(error),
    }).save()
    return {
      status: 'failed',
      message: 'Ouve um erro ao executar a função, tente novamente',
      object: null,
    };
  }
}