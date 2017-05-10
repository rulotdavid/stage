import sys
import json
import pickle
from sklearn.ensemble import ExtraTreesRegressor

X = json.loads(sys.argv[1])
Y = json.loads(sys.argv[2])

forest = ExtraTreesRegressor(n_estimators=1000)
forest = forest.fit(X, Y)

with open("lib\\forest.obj", "wb") as filehandler:
    pickle.dump(forest, filehandler)

