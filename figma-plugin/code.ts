figma.on('run', async ({ parameters }: RunEvent) => {
  try {
    const response = await fetch('http://localhost:3000');
    console.log(await response.json());
  } catch (error) {
    console.error({ error });
  }
});
