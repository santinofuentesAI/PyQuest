export const LAB_BUILDS = [
  {
    id: "print",
    title: "Un saludo",
    line: "Haz que Python te conteste.",
    code: "print('Hola, laboratorio')\nprint('Puedo construir esto')\n",
  },
  {
    id: "mean",
    title: "Un promedio",
    line: "Mira el centro de unos números.",
    code: "numeros = [10, 12, 9, 15]\nprint(sum(numeros) / len(numeros))\n",
  },
  {
    id: "chart",
    title: "Un gráfico",
    line: "Dibuja cómo van los días.",
    code: "import matplotlib.pyplot as plt\nfig, ax = plt.subplots()\nax.bar(['Lun', 'Mar', 'Mié'], [3, 5, 4])\nax.set_title('Qué puedo mostrar')\n",
  },
] as const;
