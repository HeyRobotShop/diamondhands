import _ from "lodash";

class Store {
  private state;
  private requestTracker = {};
  private onUpdateStack = [];
  private waitingForKeys = {};

  constructor(initialState) {
    this.state = initialState;

    log("debug", "🗺 Store ctx:", this);
    window.bug = this.debug;
  }

  public set(newState) {
    log("debug", "🚮 Old state:", this.state);
    log("debug", "💽 New state:", newState);
    
    // Object.assign not recommended for deep merge
    this.state = _.merge(this.state, newState); 

    window.setTimeout(() => {
      log("dev", "🍱 Store state:", this.state);

      this.checkWaitFor();

      this.onUpdateStack.forEach( (f) => {
        log("all", "🥞 Store onUpdateStack:", f);
        f(this.state);
      });
    }, 0);
  }

  public get(passKey) {
    log("debug", "💅 Store#get:", passKey);
    
    if (!passKey || passKey === "") {
      error("🙈 Invalid store request: ", arguments);
    }

    return this.cacheKey(passKey);
  }

  public getFromServer(model, attr) {
    // Already requested it
    if (this.requestTracker[attr]) return this.requestTracker[attr];

    if (!attr || !model) {
      error("🙈 Invalid store request: ", attr, model);
    }

    model.controller.onFinishedFetching( (res) => {
      this.handleServerResponse(attr, model, res);
    });

    log("dev", "🌀 Starting get from server...", model.name, attr);
    
    if (this.isGraphql(model, attr)) {
      this.requestTracker[attr] = model.controller.gqlAttribute({
        client: model.controller.client(),
        action: attr
      });
    } else {
      this.requestTracker[attr] = model.controller.getAttribute(attr);
    }

    return this.requestTracker[attr];
  }

  public waitFor(passKey, f) {
    const value = this.get(passKey);

    if ( this.valid(value) ) {
      return f(value);
    }

    if ( _.includes(this.waitingForKeys[passKey], f) ) {
      return;
    }

    if (this.waitingForKeys[passKey]) {
      this.waitingForKeys[passKey].push(f);
    } else {
      this.waitingForKeys[passKey] = [f];
    }
  }

  public onUpdate = (f) => {
    log("all", "🥞 Store#onUpdate:", f);
    this.onUpdateStack.push(f);
    return 'ok';
  }

  // private

  private checkWaitFor() {
    log("debug", "🧳 Check wait for:", Object.keys(this.waitingForKeys))

    Object.keys(this.waitingForKeys).forEach( (passKey) => {
      const value = this.get(passKey);
      log("debug", "🧳 Value:", value);

      if ( this.valid(value) ) {
        this.waitingForKeys[passKey].forEach( (f) => {
          log("debug", "🧳 Wait for callback called:", f);
          f(value);
        });

        log("debug", "🧳 Destroyed:", this.waitingForKeys[passKey]);
        delete this.waitingForKeys[passKey];
      }
    });
  }

  private isGraphql(model, attr) {
    return model.controller.requestBody(attr).kind === "Document";
  }

  private cacheKey(passKey) {
    const cachedValue = _.get(this.state, passKey)
    
    if ( this.valid(cachedValue) ) {
      log("debug", "💰 Cached value:", cachedValue);
      return cachedValue;
    }
  }

  private handleServerResponse = (attr, model, res) => {
    log("dev", "📜 Response:", res);
    let newStateObj = {};
    
    // Save new state to store
    const relevantData = _(res).get( model.controller.accessor() );
    
    if (relevantData.results) {
      newStateObj[model.name] = newStateObj[model.name] || {};
      newStateObj[model.name][attr] = relevantData.results;
    } else {
      newStateObj[model.name] = relevantData;
    }

    this.set(newStateObj);
  }

  private valid(x) {
    log("debug", "🦆 Store#valid type:", typeof x);
    return !_.isNil(x) && !_.isNaN(x);
  }

  private debug = () => {
    if (this.state) log("dev", "🍱", this.state);
    return this.state;
  }
}

const initialState = {};
const store = new Store(initialState);

export default store;
