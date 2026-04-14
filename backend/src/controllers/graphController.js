import Graph from '../models/Graph.js';

export const saveGraph = async (req, res) => {
    try {
        const { title, functionsState, pointsState, settings, isPublic, overwrite } = req.body;
        
        if (req.user) {
            const existing = await Graph.findOne({ owner: req.user._id, title });
            if (existing) {
                if (overwrite) {
                    existing.functionsState = functionsState;
                    existing.pointsState = pointsState;
                    existing.settings = settings;
                    existing.isPublic = isPublic !== undefined ? isPublic : existing.isPublic;
                    await existing.save();
                    return res.status(200).json(existing);
                } else {
                    return res.status(409).json({ message: "DUPLICATE_TITLE" });
                }
            }
        }
        
        const graph = await Graph.create({
            owner: req.user ? req.user._id : undefined,
            title,
            functionsState,
            pointsState,
            settings,
            isPublic
        });
        res.status(201).json(graph);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMyGraphs = async (req, res) => {
    try {
        const graphs = await Graph.find({ owner: req.user._id }).sort({ createdAt: -1 });
        res.json(graphs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteGraph = async (req, res) => {
    try {
        const { shortId } = req.params;
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: "User not authenticated" });
        }
        const result = await Graph.findOneAndDelete({ owner: req.user._id, shortId: shortId });
        if (!result) return res.status(404).json({ message: "Graph not found or you don't have permission" });
        res.json({ message: "Graph deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getGraphByShortId = async (req, res) => {
    try {
        const graph = await Graph.findOne({ shortId: req.params.shortId });
        if (!graph) return res.status(404).json({ message: 'Graph not found' });
        res.json(graph);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateGraph = async (req, res) => {
    try {
        const { shortId } = req.params;
        const { title, functionsState, pointsState, settings, isPublic, overwrite } = req.body;
        
        const existing = await Graph.findOne({ owner: req.user._id, shortId });
        if (!existing) return res.status(404).json({ message: "Graph not found" });

        if (title && title !== existing.title) {
            const conflict = await Graph.findOne({ owner: req.user._id, title });
            if (conflict) {
                if (overwrite) {
                    // If overwrite is true, delete the old conflicting graph first
                    await Graph.deleteOne({ _id: conflict._id });
                } else {
                    return res.status(409).json({ message: "DUPLICATE_TITLE" });
                }
            }
        }

        if (title) existing.title = title;
        if (functionsState !== undefined) existing.functionsState = functionsState;
        if (pointsState !== undefined) existing.pointsState = pointsState;
        if (settings !== undefined) existing.settings = settings;
        if (isPublic !== undefined) existing.isPublic = isPublic;

        await existing.save();
        res.json(existing);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
