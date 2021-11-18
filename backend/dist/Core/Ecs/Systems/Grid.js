"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sys_CheckCollisions = exports.sys_UpdateCollisions = exports.sys_UpdateGrid = void 0;
// Math imports
var Math_1 = require("../../../Utils/Math");
// For neighbor checks
var offsetX = [-1, 0, 1, 1, 1, 0, -1, -1];
var offsetY = [-1, -1, -1, 0, 1, 1, 1, 0];
var sys_UpdateGrid = function (data, deltaTime) {
    // Iterates through all grids in system
    data.grids.forEach(function (grid) {
        // Just dynamics entitys should be checked
        grid.dynamics.forEach(function (dynamic) {
            var transform = dynamic.entity.getTransform();
            // Changes coordinate sistem from ndc to normalized left-upper origin
            var position = transform.pos.adds(1.0).divs(2.0);
            position.y = 1 - position.y;
            // Find new index of entity
            var index = new Math_1.Vec2(Math.floor(position.x / (grid.intervalX / 2.0)), Math.floor(position.y / (grid.intervalY / 2.0)));
            // Update the index in the definition
            dynamic.index = index;
        });
    });
};
exports.sys_UpdateGrid = sys_UpdateGrid;
var collisionsResults = [];
var sys_CheckCollisions = function (data, deltaTime) {
    data.grids.forEach(function (grid) {
        grid.dynamics.map(function (dynamic) {
            var behavior = dynamic.entity.getBehavior();
            behavior.colliding = [];
        });
        collisionsResults.map(function (collision) {
            if (collision.entity.destroyed || collision.other.destroyed)
                return;
            var behavior = collision.entity.getBehavior();
            var otherBehavior = collision.other.getBehavior();
            behavior.colliding.push(collision.other);
            otherBehavior.colliding.push(collision.entity);
        });
        collisionsResults = [];
    });
};
exports.sys_CheckCollisions = sys_CheckCollisions;
var sys_UpdateCollisions = function (data, deltaTime) {
    data.grids.forEach(function (grid) {
        var _loop_1 = function (i) {
            // Current dynamic entity data
            var entity = grid.dynamics[i].entity;
            var index = grid.dynamics[i].index;
            // Get current dynamic entity rigidbody
            var rigidbody = entity.getRigidbody();
            //
            //  First pass for dynamic entities
            //
            // Store entities ordered by contact time
            var sortedEntities = [];
            for (var j = i + 1; j < grid.dynamics.length; ++j) {
                // Get other dynamic entity rigidbody
                var otherRigidbody = grid.dynamics[j].entity.getRigidbody();
                // Test collision against other entity
                var result = rigidbody.colide(otherRigidbody, deltaTime);
                if (result.intersect) {
                    collisionsResults.push({
                        entity: entity,
                        other: grid.dynamics[j].entity
                    });
                    sortedEntities.push({
                        other: otherRigidbody,
                        result: result
                    });
                }
            }
            // Sorts based on contact time
            sortedEntities.sort(function (a, b) {
                if (Math.abs(a.result.contactTime) < Math.abs(b.result.contactTime))
                    return -1;
                if (Math.abs(a.result.contactTime) > Math.abs(b.result.contactTime))
                    return 1;
                return 0;
            });
            // Solves the collison
            sortedEntities.forEach(function (_a) {
                var other = _a.other, result = _a.result;
                // Fix for current entity
                rigidbody.velocity.x += result.contactNormal.x * Math.abs(rigidbody.velocity.x) * (1.0 - result.contactTime);
                rigidbody.velocity.y += result.contactNormal.y * Math.abs(rigidbody.velocity.y) * (1.0 - result.contactTime);
                // Fix for other entity
                other.velocity.x += (result.contactNormal.x * -1.0) * Math.abs(other.velocity.x) * (1.0 - result.contactTime);
                other.velocity.y += (result.contactNormal.y * -1.0) * Math.abs(other.velocity.y) * (1.0 - result.contactTime);
                // Stop both entities if colliding perfect in horizontal
                if (result.contactNormal.x == 0 && result.contactNormal.y == 0) {
                    rigidbody.velocity.x = 0;
                    rigidbody.velocity.y = 0;
                    other.velocity.x = 0;
                    other.velocity.y = 0;
                }
            });
            //
            //  Second pass for static cells
            //
            var sortedStatics = [];
            // Check static neighbour
            for (var i_1 = 0; i_1 < 8; ++i_1) {
                var nx = index.x + offsetX[i_1];
                var ny = index.y + offsetY[i_1];
                if (nx < 0 || nx >= grid.width || ny < 0 || ny >= grid.height)
                    continue;
                var other = grid.statics[ny * grid.height + nx];
                if (!other)
                    continue;
                var result = rigidbody.colideStatic(other, deltaTime);
                if (result.intersect) {
                    sortedStatics.push(result);
                }
            }
            // Sorts based on contact time
            sortedStatics.sort(function (a, b) {
                if (Math.abs(a.contactTime) < Math.abs(b.contactTime))
                    return -1;
                if (Math.abs(a.contactTime) > Math.abs(b.contactTime))
                    return 1;
                return 0;
            });
            // Solves the collison
            sortedStatics.forEach(function (result) {
                // Fix for current entity
                rigidbody.velocity.x += (result.contactNormal.x * Math.abs(rigidbody.velocity.x) * (1.0 - result.contactTime)) * 1.001;
                rigidbody.velocity.y += (result.contactNormal.y * Math.abs(rigidbody.velocity.y) * (1.0 - result.contactTime)) * 1.001;
                if (result.contactNormal.x == 0 && result.contactNormal.y == 0) {
                    rigidbody.velocity.x = 0;
                    rigidbody.velocity.y = 0;
                }
            });
        };
        for (var i = 0; i < grid.dynamics.length; ++i) {
            _loop_1(i);
        }
        var _loop_2 = function (i) {
            // Current dynamic entity data
            var entity = grid.dynamics[i].entity;
            var index = grid.dynamics[i].index;
            // Get current dynamic entity rigidbody
            var rigidbody = entity.getRigidbody();
            //
            //  First pass for dynamic entities
            //
            // Store entities ordered by contact time
            var sortedEntities = [];
            for (var j = i + 1; j < grid.dynamics.length; ++j) {
                // Get other dynamic entity rigidbody
                var otherRigidbody = grid.dynamics[j].entity.getRigidbody();
                // Test collision against other entity
                var result = rigidbody.colide(otherRigidbody, deltaTime);
                if (result.intersect) {
                    collisionsResults.push({
                        entity: entity,
                        other: grid.dynamics[j].entity
                    });
                    sortedEntities.push({
                        other: otherRigidbody,
                        result: result
                    });
                }
            }
            // Sorts based on contact time
            sortedEntities.sort(function (a, b) {
                if (Math.abs(a.result.contactTime) < Math.abs(b.result.contactTime))
                    return -1;
                if (Math.abs(a.result.contactTime) > Math.abs(b.result.contactTime))
                    return 1;
                return 0;
            });
            // Solves the collison
            sortedEntities.forEach(function (_a) {
                var other = _a.other, result = _a.result;
                // Fix for current entity
                rigidbody.velocity.x += result.contactNormal.x * Math.abs(rigidbody.velocity.x) * (1.0 - result.contactTime);
                rigidbody.velocity.y += result.contactNormal.y * Math.abs(rigidbody.velocity.y) * (1.0 - result.contactTime);
                // Fix for other entity
                other.velocity.x += (result.contactNormal.x * -1.0) * Math.abs(other.velocity.x) * (1.0 - result.contactTime);
                other.velocity.y += (result.contactNormal.y * -1.0) * Math.abs(other.velocity.y) * (1.0 - result.contactTime);
                // Stop both entities if colliding perfect in horizontal
                if (result.contactNormal.x == 0 && result.contactNormal.y == 0) {
                    rigidbody.velocity.x = 0;
                    rigidbody.velocity.y = 0;
                    other.velocity.x = 0;
                    other.velocity.y = 0;
                }
            });
        };
        for (var i = 0; i < grid.dynamics.length; ++i) {
            _loop_2(i);
        }
    });
};
exports.sys_UpdateCollisions = sys_UpdateCollisions;
