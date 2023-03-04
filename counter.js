// IIFE => Immediately Invoked Function Expression - Utilizada para que o código não fique exposto no escopo global e passamos a classe "Counter" para o objeto "window" para que possamos acessar a classe fora do arquivo
(() => {
  const RESTART_BTN_ID = "restart-btn";
  const COUNTER_ID = "counter";

  class Counter {
    #RESTART_BTN = document.getElementById(RESTART_BTN_ID);
    #COUNTER = document.getElementById(COUNTER_ID);
    #COUNTER_VALUE = 100;
    #INTERVAL = 1000;

    constructor() {
      this.start();
    }

    // Função que retorna um "Proxy Object" responsável por atualizar o valor do contador que nos permite executar algo após alterar o valor passado
    prepareAccountantProxy() {
      const handler = {
        set: (currentContext, propertyKey, newValue) => {
          // para todo o processamento
          if (!currentContext.value) currentContext.stop();

          currentContext[propertyKey] = newValue;
          return true;
        },
      };

      const counter = new Proxy(
        {
          value: this.#COUNTER_VALUE,
          stop: () => {},
        },
        handler
      );

      return counter;
    }

    // Função no padrão "Closure" que retorna uma função que atualiza o valor do contador no DOM
    textUpdate =
      ({ counterElement, counter }) =>
      () => {
        counterElement.classList.add("pulse");
        const identifierText = "$$counter";
        const textDefault = `Começando em <strong>${identifierText}</strong> segundos...`;

        counterElement.innerHTML = textDefault.replace(
          identifierText,
          counter.value--
        );
      };

    scheduleCounterStop({ counterElement, intervalId }) {
      return () => {
        clearInterval(intervalId);
        counterElement.innerHTML = `Começando em <strong>100</strong> segundos...`;
        counterElement.classList.remove("pulse");
        this.disableButton(false);
        console.log("finalizou");
      };
    }

    handlerRestartButton(buttonElement, startFn) {
      buttonElement.addEventListener("click", startFn.bind(this));
      const attr = "disabled";
      buttonElement.setAttribute(attr, true);

      return () => {
        buttonElement.removeEventListener("click", startFn.bind(this));
        buttonElement.removeAttribute(attr);
      };
    }

    start() {
      console.log("inicializou");

      const counterElement = this.#COUNTER;

      const counter = this.prepareAccountantProxy();
      const counterArguments = {
        counterElement,
        counter,
      };

      const textUpdate = this.textUpdate(counterArguments);

      const intervalId = setInterval(textUpdate, this.#INTERVAL);

      // utilização de contextos onde é possível usar o mesmo nome de variáveis dentro das "{}" sem conflito de escopo, por exemplo o objeto "counterArguments"
      {
        const disableButton = this.handlerRestartButton(
          this.#RESTART_BTN,
          this.start
        );

        const counterArguments = { counterElement, intervalId };

        // Usa o metodo "apply" para substituir o contexto do "this" dentro da função "scheduleCounterStop", substituindo o "this" por um objeto com a propriedade "disableButton". É possível passar um array de argumentos para a função "scheduleCounterStop" através do segundo parâmetro do método "apply"
        const counterStop = this.scheduleCounterStop.apply(
          {
            disableButton,
          },
          [counterArguments]
        );

        counter.stop = counterStop;
      }
    }
  }

  window.Counter = Counter;
})();
