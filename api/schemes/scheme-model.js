const db = require("./../../data/db-config");

const find = async () => {
  const schemes = db("schemes as sc")
    .leftJoin("steps as st", "sc.scheme_id", "st.scheme_id")
    .select("sc.*")
    .count("st.step_id", { as: "number_of_steps" })
    .groupBy("sc.scheme_id")
    .orderBy("sc.scheme_id");
  return schemes;
};

const findById = async (scheme_id) => {
  const schemes = await db("schemes as sc")
    .leftJoin("steps as st", "sc.scheme_id", "st.scheme_id")
    .where("sc.scheme_id", scheme_id)
    .select("sc.scheme_name", "st.*")
    .orderBy("st.step_number");
  const stepsArr = schemes.map((scheme) => {
    return {
      step_id: scheme.step_id,
      step_number: scheme.step_number,
      instructions: scheme.instructions,
    };
  });
  const results = {
    scheme_id: schemes[0].scheme_id,
    scheme_name: schemes[0].scheme_name,
    steps: schemes[0].instructions ? stepsArr : [],
  };
  return results;
};

const findSteps = async (scheme_id) => {
  const steps = await db("schemes as sc")
    .leftJoin("steps as st", "sc.scheme_id", "st.scheme_id")
    .where("sc.scheme_id", scheme_id)
    .select("step_id", "step_number", "instructions", "scheme_name")
    .orderBy("step_number");
  return !steps[0].step_id ? [] : steps;
};

function add(scheme) {
  return db("schemes")
    .insert(scheme)
    .then((scheme_id) => {
      return db("schemes").where("scheme_id", scheme_id).first();
    });
}

function addStep(scheme_id, step) {
  return db("steps")
    .insert({
      ...step,
      scheme_id,
    })
    .then(() => {
      return db("steps as st")
        .join("schemes as sc", "sc.scheme_id", "st.scheme_id")
        .select("step_id", "step_number", "instructions", "scheme_name")
        .orderBy("step_number")
        .where("sc.scheme_id", scheme_id);
    });
}

module.exports = {
  find,
  findById,
  findSteps,
  add,
  addStep,
};
