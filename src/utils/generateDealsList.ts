
export const generateDealsList = (pipelines: any, deals: any) => {
  // Ordena os pipelines por posição
  const sortedPipelines = pipelines.slice().sort((a: any, b: any) => a.position - b.position);

  // Gera a lista de negócios com base nos pipelines ordenados
  return sortedPipelines.reduce((acc: any, pipeline: any) => {
    acc[pipeline.id] = {
      ...pipeline,
      deals: deals.filter((deal: any) => deal.pipeline.id === pipeline.id),
    };
    return acc;
  }, {});
};